import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, resolve, sep } from 'path'
import { randomUUID } from 'crypto'

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILES = 5

// Корень uploads — резолвим один раз для проверок path traversal
const UPLOADS_ROOT = resolve(process.cwd(), 'uploads')

// Простая проверка: строка не содержит разделителей пути и не равна "." / ".."
function isSafeSegment(segment: string): boolean {
  if (!segment || segment === '.' || segment === '..') return false
  if (segment.includes('/') || segment.includes('\\') || segment.includes('\0')) return false
  return true
}

export function validateFile(file: { type: string; size: number; name: string }): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `${file.name}: разрешены только JPG и PNG`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: файл превышает 10MB`
  }
  return null
}

// Серверная валидация: проверяем не только заголовок, но и магические байты файла
async function detectImageType(buffer: Buffer): Promise<'image/jpeg' | 'image/png' | null> {
  if (buffer.length < 8) return null
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png'
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  return null
}

export async function saveInputFiles(
  files: File[],
  userId: string,
  generationId: string
): Promise<string[]> {
  // Жёсткая проверка userId и generationId — они приходят в путь
  if (!isSafeSegment(userId)) {
    throw new Error('Invalid userId')
  }
  if (!isSafeSegment(generationId)) {
    throw new Error('Invalid generationId')
  }

  const dir = join(UPLOADS_ROOT, 'inputs', userId, generationId)

  // Убеждаемся, что итоговый путь действительно внутри UPLOADS_ROOT
  const resolvedDir = resolve(dir)
  if (!resolvedDir.startsWith(UPLOADS_ROOT + sep) && resolvedDir !== UPLOADS_ROOT) {
    throw new Error('Path traversal detected')
  }

  await mkdir(resolvedDir, { recursive: true })

  const paths: string[] = []

  for (const file of files) {
    // Перепроверяем тип и размер на сервере (клиентский заголовок легко подделать)
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Файл ${file.name} превышает ${MAX_FILE_SIZE} байт`)
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Файл ${file.name}: неподдерживаемый тип ${file.type}`)
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Проверяем магические байты — реальный тип файла, а не Content-Type
    const detected = await detectImageType(buffer)
    if (!detected) {
      throw new Error(`Файл ${file.name}: не является JPG или PNG`)
    }

    const ext = detected === 'image/png' ? '.png' : '.jpg'
    const filename = `${randomUUID()}${ext}`
    const fullPath = join(resolvedDir, filename)
    await writeFile(fullPath, buffer)
    paths.push(`inputs/${userId}/${generationId}/${filename}`)
  }

  return paths
}

export async function saveResultFile(
  buffer: Buffer,
  userId: string,
  generationId: string
): Promise<string> {
  if (!isSafeSegment(userId)) {
    throw new Error('Invalid userId')
  }
  if (!isSafeSegment(generationId)) {
    throw new Error('Invalid generationId')
  }

  const dir = join(UPLOADS_ROOT, 'results', userId)
  const resolvedDir = resolve(dir)
  if (!resolvedDir.startsWith(UPLOADS_ROOT + sep) && resolvedDir !== UPLOADS_ROOT) {
    throw new Error('Path traversal detected')
  }

  await mkdir(resolvedDir, { recursive: true })

  const filename = `${generationId}.png`
  const fullPath = join(resolvedDir, filename)
  await writeFile(fullPath, buffer)

  return `results/${userId}/${filename}`
}

// Безопасный резолв пути: гарантирует, что результат внутри UPLOADS_ROOT.
// Возвращает null, если попытка выйти за пределы.
export function resolveUploadPath(relativePath: string): string | null {
  const resolved = resolve(UPLOADS_ROOT, relativePath)
  if (!resolved.startsWith(UPLOADS_ROOT + sep) && resolved !== UPLOADS_ROOT) {
    return null
  }
  return resolved
}

export function uploadFileExists(relativePath: string): boolean {
  const full = resolveUploadPath(relativePath)
  if (!full) return false
  return existsSync(full)
}
