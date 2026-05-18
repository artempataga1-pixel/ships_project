import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const STYLE_PROMPTS: Record<string, string> = {
  ghibli:
    'Transform into Studio Ghibli anime style with soft watercolor textures, warm lighting, hand-drawn aesthetic',
  watercolor:
    'Convert into delicate watercolor painting with transparent washes and soft bleeding edges',
  'oil-painting':
    'Reimagine as classic oil painting with thick visible brushstrokes, rich colors, dramatic lighting',
  vintage: 'Apply vintage 1960s film aesthetic with warm sepia tones, grain, faded colors',
  anime: 'Transform into modern anime style with clean lines, vibrant colors, cell shading',
  cyberpunk: 'Stylize as cyberpunk scene with neon accents, dark atmosphere, holographic effects',
  sketch: 'Convert into detailed pencil sketch with fine line art and cross-hatching',
  'golden-hour':
    'Enhance with golden hour photography: warm orange-gold light, long shadows',
  'cinematic-bw':
    'Convert to cinematic black & white with high contrast, film noir atmosphere',
  'fairy-tale':
    'Transform into magical fairy tale illustration with ethereal glow and fantasy elements',
}

export type ImageInput = {
  buffer: Buffer
  mimeType: 'image/jpeg' | 'image/png'
}

export async function stylizeImage(
  images: ImageInput[],
  styleId: string,
  userPrompt?: string
): Promise<Buffer> {
  const stylePrompt = STYLE_PROMPTS[styleId]
  if (!stylePrompt) throw new Error(`Неизвестный стиль: ${styleId}`)

  const fullPrompt = userPrompt
    ? `${stylePrompt}. Additional details: ${userPrompt}`
    : stylePrompt

  const imageParts = images.map((img) => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.buffer.toString('base64'),
    },
  }))

  let lastError: Error = new Error('Ошибка генерации')

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [
          {
            role: 'user',
            parts: [...imageParts, { text: fullPrompt }],
          },
        ],
        config: {
          responseModalities: ['IMAGE'],
        },
      })

      const parts = response.candidates?.[0]?.content?.parts ?? []
      for (const part of parts) {
        if (part.inlineData?.data) {
          return Buffer.from(part.inlineData.data, 'base64')
        }
      }

      throw new Error('Gemini не вернул изображение в ответе')
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError
}
