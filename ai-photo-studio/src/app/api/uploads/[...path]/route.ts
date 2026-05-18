import { auth } from '@/auth'
import { readFile } from 'fs/promises'
import { resolveUploadPath } from '@/lib/upload'

// Сегмент должен быть простым (без слешей, нулевых байт, точечных путей)
function isSafeSegment(segment: string): boolean {
  if (!segment || segment === '.' || segment === '..') return false
  if (segment.includes('/') || segment.includes('\\') || segment.includes('\0')) return false
  return true
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { path } = await params

  // Допустимые структуры:
  //   inputs/{userId}/{generationId}/{filename}   — 4 сегмента
  //   results/{userId}/{filename}                 — 3 сегмента
  if (!path || path.length < 3 || path.length > 4) {
    return new Response('Not Found', { status: 404 })
  }

  // Каждый сегмент пути должен быть безопасным — защита от path traversal
  for (const segment of path) {
    if (!isSafeSegment(segment)) {
      return new Response('Bad Request', { status: 400 })
    }
  }

  const kind = path[0]
  if (kind !== 'inputs' && kind !== 'results') {
    return new Response('Not Found', { status: 404 })
  }

  // Структура должна соответствовать виду
  if (kind === 'inputs' && path.length !== 4) {
    return new Response('Not Found', { status: 404 })
  }
  if (kind === 'results' && path.length !== 3) {
    return new Response('Not Found', { status: 404 })
  }

  const userId = path[1]
  if (userId !== session.user.id) {
    return new Response('Forbidden', { status: 403 })
  }

  const relativePath = path.join('/')
  const fullPath = resolveUploadPath(relativePath)
  if (!fullPath) {
    return new Response('Bad Request', { status: 400 })
  }

  let file: Buffer
  try {
    file = await readFile(fullPath)
  } catch {
    return new Response('Not Found', { status: 404 })
  }

  const filename = path[path.length - 1]
  const contentType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

  return new Response(new Uint8Array(file), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
