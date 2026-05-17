import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, initializeDatabase } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import fs from "fs/promises";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  await initializeDatabase();

  const rows = await db
    .select()
    .from(generations)
    .where(eq(generations.userId, session.user.id))
    .orderBy(desc(generations.createdAt))
    .limit(50);

  return NextResponse.json({ generations: rows });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID не указан" }, { status: 400 });
  }

  await initializeDatabase();

  const rows = await db
    .select()
    .from(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, session.user.id)));

  const gen = rows[0];
  if (!gen) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  // Удаляем файл результата
  if (gen.resultImagePath) {
    await fs.unlink(gen.resultImagePath).catch(() => {});
  }

  // Удаляем исходные файлы
  const sourcePaths = JSON.parse(gen.sourceImagePaths ?? "[]") as string[];
  for (const p of sourcePaths) {
    await fs.unlink(p).catch(() => {});
  }

  await db
    .delete(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
