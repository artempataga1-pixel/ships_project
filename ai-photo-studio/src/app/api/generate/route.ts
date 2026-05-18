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
import { saveInputFiles, saveResultFile, MAX_FILES } from '@/lib/upload'
import { stylizeImage, type ImageInput } from '@/lib/gemini'

const VALID_STYLES = [
  'ghibli', 'watercolor', 'oil-painting', 'vintage', 'anime',
  'cyberpunk', 'sketch', 'golden-hour', 'cinematic-bw', 'fairy-tale',
]

const VALID_ASPECT_RATIOS = ['1:1', '9:16', '16:9']

const MAX_PROMPT_LENGTH = 500

// Детектирует mime type по магическим байтам — надёжнее чем file.type
function detectMime(buffer: Buffer): 'image/jpeg' | 'image/png' | null {
  if (buffer.length < 8) return null
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 &&
    buffer[2] === 0x4e && buffer[3] === 0x47
  ) return 'image/png'
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  return null
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
  }
  const userId = session.user.id

  // Парсим FormData
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

  if (!style || typeof style !== 'string' || !VALID_STYLES.includes(style)) {
    return NextResponse.json({ error: 'Выберите корректный стиль' }, { status: 400 })
  }

  if (!files.length) {
    return NextResponse.json({ error: 'Загрузите хотя бы одно изображение' }, { status: 400 })
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Максимум ${MAX_FILES} изображений` }, { status: 400 })
  }

  const aspectRatio =
    typeof aspectRatioRaw === 'string' && VALID_ASPECT_RATIOS.includes(aspectRatioRaw)
      ? aspectRatioRaw
      : '1:1'

  // Ограничиваем промпт 500 символами
  const userPrompt =
    typeof promptRaw === 'string' && promptRaw.trim()
      ? promptRaw.trim().slice(0, MAX_PROMPT_LENGTH)
      : undefined

  // Атомарная проверка лимита + инкремент (без race condition)
  const allowed = checkAndIncrementLimit(userId)
  if (!allowed) {
    return NextResponse.json(
      { error: `Достигнут лимит в ${GENERATION_LIMIT} генераций` },
      { status: 403 }
    )
  }

  const generationId = randomUUID()

  // Создаём запись в БД (status: processing)
  await db.insert(generations).values({
    id: generationId,
    userId,
    status: 'processing',
    style,
    prompt: userPrompt ?? null,
    aspectRatio,
  })

  try {
    // Сохраняем входные файлы на диск
    const sourceImagePaths = await saveInputFiles(files, userId, generationId)

    await db
      .update(generations)
      .set({ sourceImagePaths: JSON.stringify(sourceImagePaths) })
      .where(eq(generations.id, generationId))

    // Читаем буферы и детектируем mime по магическим байтам
    const images: ImageInput[] = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        const mimeType = detectMime(buffer)
        if (!mimeType) throw new Error(`Файл ${file.name}: неподдерживаемый формат`)
        return { buffer, mimeType }
      })
    )

    // Вызываем Gemini
    const resultBuffer = await stylizeImage(images, style, userPrompt)

    // Сохраняем результат
    const resultImagePath = await saveResultFile(resultBuffer, userId, generationId)

    // Обновляем запись (completed) — лимит уже инкрементирован до генерации
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

    // Откатываем инкремент лимита — генерация не удалась
    decrementGenerations(userId)

    await db
      .update(generations)
      .set({ status: 'failed', errorMessage })
      .where(eq(generations.id, generationId))

    return NextResponse.json({ error: 'Ошибка генерации изображения' }, { status: 500 })
  }
}
