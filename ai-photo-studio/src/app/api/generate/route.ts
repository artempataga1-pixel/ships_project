import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { generations } from '@/lib/db/schema'
import { checkLimit, incrementGenerations, GENERATION_LIMIT } from '@/lib/limits'
import { saveInputFiles, saveResultFile, MAX_FILES } from '@/lib/upload'
import { stylizeImage, type ImageInput } from '@/lib/gemini'

const VALID_STYLES = [
  'ghibli', 'watercolor', 'oil-painting', 'vintage', 'anime',
  'cyberpunk', 'sketch', 'golden-hour', 'cinematic-bw', 'fairy-tale',
]

const VALID_ASPECT_RATIOS = ['1:1', '9:16', '16:9']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
  }
  const userId = session.user.id

  // Проверяем лимит
  const withinLimit = await checkLimit(userId)
  if (!withinLimit) {
    return NextResponse.json(
      { error: `Достигнут лимит в ${GENERATION_LIMIT} генераций` },
      { status: 403 }
    )
  }

  // Парсим FormData
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 })
  }

  const style = formData.get('style')
  const prompt = formData.get('prompt')
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

  const userPrompt = typeof prompt === 'string' && prompt.trim() ? prompt.trim() : undefined

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

    // Готовим буферы для Gemini
    const images: ImageInput[] = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        const mimeType: 'image/jpeg' | 'image/png' =
          file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        return { buffer, mimeType }
      })
    )

    // Вызываем Gemini
    const resultBuffer = await stylizeImage(images, style, userPrompt)

    // Сохраняем результат
    const resultImagePath = await saveResultFile(resultBuffer, userId, generationId)

    // Обновляем запись + инкрементируем счётчик
    await db
      .update(generations)
      .set({ status: 'completed', resultImagePath, completedAt: new Date() })
      .where(eq(generations.id, generationId))

    await incrementGenerations(userId)

    return NextResponse.json({
      generationId,
      resultUrl: `/api/uploads/${resultImagePath}`,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'

    console.error(`[generate] generation ${generationId} failed:`, err)

    await db
      .update(generations)
      .set({ status: 'failed', errorMessage })
      .where(eq(generations.id, generationId))

    return NextResponse.json({ error: 'Ошибка генерации изображения' }, { status: 500 })
  }
}
