import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { generations } from '@/lib/db/schema'
import {
  checkAndIncrementLimit,
  decrementGenerations,
  GENERATION_LIMIT,
} from '@/lib/limits'
import { saveInputFiles, saveResultFile, readUploadFile, MAX_FILES } from '@/lib/upload'
import { stylizeImage, type ImageInput } from '@/lib/gemini'

const VALID_STYLES = [
  'ghibli', 'watercolor', 'oil-painting', 'vintage', 'anime',
  'cyberpunk', 'sketch', 'golden-hour', 'cinematic-bw', 'fairy-tale',
]

const VALID_ASPECT_RATIOS = ['1:1', '9:16', '16:9']

const MAX_PROMPT_LENGTH = 500

function detectMime(buffer: Buffer): 'image/jpeg' | 'image/png' | null {
  if (buffer.length < 8) return null
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 &&
    buffer[2] === 0x4e && buffer[3] === 0x47
  ) return 'image/png'
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  return null
}

// Строгая проверка пути re-generate: ровно 4 сегмента, только inputs/<userId>/<uuid>/<file>
function isSafeRegeneratePath(p: string, userId: string): boolean {
  if (typeof p !== 'string') return false
  if (p.includes('..') || p.includes('\\') || p.includes('\0')) return false
  const normalised = p.replace(/\/+/g, '/')
  if (normalised !== p) return false
  const parts = p.split('/')
  if (parts.length !== 4) return false
  if (parts[0] !== 'inputs' || parts[1] !== userId) return false
  if (!parts[2] || !parts[3]) return false
  return true
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
  }
  const userId = session.user.id

  // userId из JWT — это UUID, но на всякий случай проверяем
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
    return NextResponse.json({ error: 'Неверный идентификатор сессии' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 })
  }

  const style = formData.get('style')
  const promptRaw = formData.get('prompt')
  const aspectRatioRaw = formData.get('aspectRatio')
  const files = formData.getAll('files') as File[]
  const sourceImagePathsRaw = formData.get('sourceImagePaths')

  if (!style || typeof style !== 'string' || !VALID_STYLES.includes(style)) {
    return NextResponse.json({ error: 'Выберите корректный стиль' }, { status: 400 })
  }

  const aspectRatio =
    typeof aspectRatioRaw === 'string' && VALID_ASPECT_RATIOS.includes(aspectRatioRaw)
      ? aspectRatioRaw
      : '1:1'

  const userPrompt =
    typeof promptRaw === 'string' && promptRaw.trim()
      ? promptRaw.trim().slice(0, MAX_PROMPT_LENGTH)
      : undefined

  const isRegenerate = files.length === 0 && typeof sourceImagePathsRaw === 'string'

  if (!isRegenerate && files.length === 0) {
    return NextResponse.json({ error: 'Загрузите хотя бы одно изображение' }, { status: 400 })
  }

  if (!isRegenerate && files.length > MAX_FILES) {
    return NextResponse.json({ error: `Максимум ${MAX_FILES} изображений` }, { status: 400 })
  }

  // Re-generate: валидируем пути ДО инкремента лимита — 400/403 не тратят квоту
  let validatedSourcePaths: string[] | null = null
  if (isRegenerate) {
    let paths: unknown
    try {
      paths = JSON.parse(sourceImagePathsRaw as string)
    } catch {
      return NextResponse.json({ error: 'Неверный формат путей файлов' }, { status: 400 })
    }

    if (!Array.isArray(paths) || paths.length === 0 || paths.length > MAX_FILES) {
      return NextResponse.json({ error: 'Неверное количество файлов' }, { status: 400 })
    }

    for (const p of paths) {
      if (!isSafeRegeneratePath(p, userId)) {
        return NextResponse.json({ error: 'Недопустимые пути файлов' }, { status: 403 })
      }
    }

    validatedSourcePaths = paths as string[]
  }

  // Только теперь инкрементируем лимит
  const allowed = checkAndIncrementLimit(userId)
  if (!allowed) {
    return NextResponse.json(
      { error: `Достигнут лимит в ${GENERATION_LIMIT} генераций` },
      { status: 403 }
    )
  }

  const generationId = randomUUID()

  await db.insert(generations).values({
    id: generationId,
    userId,
    status: 'processing',
    style,
    prompt: userPrompt ?? null,
    aspectRatio,
  })

  try {
    let images: ImageInput[]
    let sourceImagePaths: string[]

    if (isRegenerate && validatedSourcePaths) {
      sourceImagePaths = validatedSourcePaths

      images = await Promise.all(
        sourceImagePaths.map(async (p) => {
          let buffer: Buffer
          try {
            buffer = await readUploadFile(p)
          } catch (e) {
            const err = e as NodeJS.ErrnoException
            if (err.code === 'ENOENT') throw new Error(`SOURCE_MISSING:${p}`)
            throw e
          }
          const mimeType = detectMime(buffer)
          if (!mimeType) throw new Error(`Файл ${p}: неподдерживаемый формат`)
          return { buffer, mimeType }
        })
      )
    } else {
      sourceImagePaths = await saveInputFiles(files, userId, generationId)

      images = await Promise.all(
        files.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer())
          const mimeType = detectMime(buffer)
          if (!mimeType) throw new Error(`Файл ${file.name}: неподдерживаемый формат`)
          return { buffer, mimeType }
        })
      )
    }

    await db
      .update(generations)
      .set({ sourceImagePaths: JSON.stringify(sourceImagePaths) })
      .where(eq(generations.id, generationId))

    const resultBuffer = await stylizeImage(images, style, userPrompt)

    const resultImagePath = await saveResultFile(resultBuffer, userId, generationId)

    await db
      .update(generations)
      .set({ status: 'completed', resultImagePath, completedAt: new Date() })
      .where(eq(generations.id, generationId))

    return NextResponse.json({
      generationId,
      resultUrl: `/api/uploads/${resultImagePath}`,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'

    console.error(`[generate] generation ${generationId} failed:`, err)

    decrementGenerations(userId)

    await db
      .update(generations)
      .set({ status: 'failed', errorMessage })
      .where(eq(generations.id, generationId))

    // Исходные файлы недоступны (удалены) — возвращаем 410 Gone
    if (typeof err === 'object' && err !== null && 'message' in err &&
        typeof (err as Error).message === 'string' &&
        (err as Error).message.startsWith('SOURCE_MISSING:')) {
      return NextResponse.json(
        { error: 'Исходные файлы недоступны. Создайте новую генерацию.' },
        { status: 410 }
      )
    }

    return NextResponse.json({ error: 'Ошибка генерации изображения' }, { status: 500 })
  }
}
