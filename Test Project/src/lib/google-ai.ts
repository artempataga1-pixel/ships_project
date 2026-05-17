import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

const STYLE_PROMPTS: Record<string, string> = {
  cinematic:
    "cinematic family photo, warm tones, deep shadows, film look, golden hour lighting, professional photography",
  vintage:
    "vintage retro family photo, 1970s film grain, faded colors, analog photography, nostalgic atmosphere",
  fairytale:
    "magical fairytale family photo, soft dreamy light, pastel colors, enchanting forest background, fairy tale atmosphere",
  boho: "bohemian family photo, natural textures, earth tones, outdoor nature setting, boho aesthetic, lifestyle photography",
  minimalist:
    "minimalist family portrait, clean neutral background, soft studio lighting, modern aesthetic, simple elegant style",
  holiday:
    "festive holiday family photo, Christmas or New Year theme, warm lights, cozy atmosphere, joyful celebration",
  blackwhite:
    "classic black and white family portrait, high contrast, dramatic lighting, timeless elegant photography",
  dreamy:
    "dreamy soft family photo, gentle bokeh background, pastel hues, soft natural light, romantic atmosphere",
  goldenhour:
    "golden hour family photo, warm sunset light, golden glowing backlight, outdoor nature, magical evening light",
  studio:
    "professional studio family portrait, even lighting, neutral backdrop, sharp focus, high quality portrait photography",
};

export function getStylePrompt(style: string): string {
  return STYLE_PROMPTS[style] ?? STYLE_PROMPTS.cinematic;
}

type GenerationInput = {
  id: string;
  style: string;
  prompt: string;
  aspectRatio: string;
  sourceImagePaths: string[];
};

type GenerationResult = {
  success: boolean;
  resultPath?: string;
  error?: string;
};

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? "./uploads";

async function tryGenerate(input: GenerationInput): Promise<GenerationResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Google AI API ключ не настроен" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
  });

  const stylePrompt = getStylePrompt(input.style);
  const userPrompt = input.prompt ? `. Дополнительно: ${input.prompt}` : "";
  const fullPrompt = `Transform this family photo in the following style: ${stylePrompt}${userPrompt}. Keep the people and their faces recognizable. Output a high quality stylized version of the photo.`;

  // Читаем исходные изображения
  const imageParts = await Promise.all(
    input.sourceImagePaths.map(async (p) => {
      const data = await fs.readFile(p);
      const ext = path.extname(p).toLowerCase().replace(".", "");
      const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
      return {
        inlineData: {
          data: data.toString("base64"),
          mimeType,
        },
      };
    })
  );

  const result = await model.generateContent([fullPrompt, ...imageParts]);
  const response = result.response;

  // Ищем сгенерированное изображение в ответе
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));

  if (!imagePart?.inlineData) {
    // Если модель вернула только текст — это ошибка контентной политики или неподдерживаемый ввод
    const text = response.text();
    return {
      success: false,
      error: text.length > 0
        ? `AI отказал в обработке фото: ${text.slice(0, 200)}`
        : "AI не вернул изображение. Попробуйте другое фото или стиль.",
    };
  }

  // Сохраняем результат
  const resultDir = path.join(UPLOADS_DIR, "results");
  await fs.mkdir(resultDir, { recursive: true });
  const resultPath = path.join(resultDir, `${input.id}.jpg`);

  await fs.writeFile(
    resultPath,
    Buffer.from(imagePart.inlineData.data, "base64")
  );

  return { success: true, resultPath };
}

export async function processGeneration(
  input: GenerationInput,
  maxRetries = 3
): Promise<GenerationResult> {
  let lastError = "";

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await tryGenerate(input);
      if (result.success) return result;

      // не ретраим ошибки контентной политики
      if (result.error?.includes("AI отказал")) {
        return result;
      }

      lastError = result.error ?? "Неизвестная ошибка";
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Ошибка запроса к AI";
    }

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }

  return { success: false, error: lastError };
}
