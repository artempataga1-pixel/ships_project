import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, initializeDatabase } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { canGenerate } from "@/lib/limits";
import { generationQueue } from "@/lib/queue";
import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? "./uploads";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const userId = session.user.id;

  await initializeDatabase();

  const ok = await canGenerate(userId);
  if (!ok) {
    return NextResponse.json(
      { error: "Дневной лимит исчерпан. Попробуй завтра!" },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const style = formData.get("style") as string;
  const prompt = (formData.get("prompt") as string) ?? "";
  const aspectRatio = (formData.get("aspectRatio") as string) ?? "1:1";
  const files = formData.getAll("images") as File[];

  if (!style) {
    return NextResponse.json({ error: "Выбери стиль" }, { status: 400 });
  }
  if (files.length === 0) {
    return NextResponse.json(
      { error: "Загрузи хотя бы одно фото" },
      { status: 400 }
    );
  }
  if (files.length > 5) {
    return NextResponse.json(
      { error: "Максимум 5 фото" },
      { status: 400 }
    );
  }

  // Сохраняем загруженные фото
  const uploadDir = path.join(UPLOADS_DIR, "source");
  await fs.mkdir(uploadDir, { recursive: true });

  const sourceImagePaths: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    sourceImagePaths.push(filepath);
  }

  // Создаём запись в БД
  const [generation] = await db
    .insert(generations)
    .values({
      userId,
      style,
      prompt,
      aspectRatio: aspectRatio as "1:1" | "9:16" | "16:9",
      sourceImagePaths: JSON.stringify(sourceImagePaths),
      status: "queued",
    })
    .returning();

  // Добавляем в очередь (лимит считается по количеству не-failed генераций за день)
  const position = generationQueue.enqueue({
    id: generation.id,
    userId,
    style,
    prompt,
    aspectRatio,
    sourceImagePaths,
  });

  return NextResponse.json({ id: generation.id, position });
}
