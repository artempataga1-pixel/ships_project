import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db, initializeDatabase } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { generationQueue } from "@/lib/queue";

export async function GET(
  req: NextRequest,
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

  if (rows.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const gen = rows[0];

  // Если уже завершено — сразу отвечаем
  if (gen.status === "completed" || gen.status === "failed") {
    const data = JSON.stringify({
      status: gen.status,
      resultPath: gen.resultImagePath,
      error: gen.errorMessage,
    });
    return new Response(`data: ${data}\n\n`, {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  // Иначе — SSE стрим
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const send = (payload: object) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
  };

  // Отправляем текущую позицию
  const position = generationQueue.getPosition(id);
  send({ status: gen.status, position: position > 0 ? position : undefined });

  const onUpdate = (data: { status: string; position?: number; resultPath?: string; error?: string }) => {
    send(data);
    if (data.status === "completed" || data.status === "failed") {
      generationQueue.unsubscribe(id, onUpdate);
      writer.close();
    }
  };

  generationQueue.subscribe(id, onUpdate);

  req.signal.addEventListener("abort", () => {
    generationQueue.unsubscribe(id, onUpdate);
    writer.close().catch(() => {});
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
