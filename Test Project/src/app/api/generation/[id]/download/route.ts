import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, initializeDatabase } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import fs from "fs/promises";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  await initializeDatabase();

  const rows = await db
    .select()
    .from(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, session.user.id)));

  const gen = rows[0];
  if (!gen || gen.status !== "completed" || !gen.resultImagePath) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  try {
    const buffer = await fs.readFile(gen.resultImagePath);
    const filename = `ai-photo-${gen.style}-${id.slice(0, 8)}.jpg`;

    return new Response(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }
}
