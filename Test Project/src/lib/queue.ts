import { db } from "./db";
import { generations } from "./db/schema";
import { eq } from "drizzle-orm";

type QueueItem = {
  id: string;
  userId: string;
  style: string;
  prompt: string;
  aspectRatio: string;
  sourceImagePaths: string[];
};

type Subscriber = (data: { status: string; position?: number; resultPath?: string; error?: string }) => void;

class GenerationQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private subscribers = new Map<string, Subscriber[]>();

  enqueue(item: QueueItem): number {
    this.queue.push(item);
    const position = this.queue.length;
    if (!this.processing) {
      this.process();
    }
    return position;
  }

  getPosition(id: string): number {
    return this.queue.findIndex((i) => i.id === id) + 1;
  }

  subscribe(id: string, cb: Subscriber) {
    const subs = this.subscribers.get(id) ?? [];
    subs.push(cb);
    this.subscribers.set(id, subs);
  }

  unsubscribe(id: string, cb: Subscriber) {
    const subs = this.subscribers.get(id) ?? [];
    this.subscribers.set(id, subs.filter((s) => s !== cb));
  }

  private notify(id: string, data: Parameters<Subscriber>[0]) {
    const subs = this.subscribers.get(id) ?? [];
    subs.forEach((cb) => cb(data));
  }

  private async process() {
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];

      // обновить позиции для всех в очереди
      this.queue.forEach((q, idx) => {
        this.notify(q.id, { status: "queued", position: idx + 1 });
      });

      await db
        .update(generations)
        .set({ status: "processing", queuePosition: null })
        .where(eq(generations.id, item.id));

      this.notify(item.id, { status: "processing" });

      const { processGeneration } = await import("./google-ai");
      const result = await processGeneration(item);

      if (result.success && result.resultPath) {
        await db
          .update(generations)
          .set({
            status: "completed",
            resultImagePath: result.resultPath,
            completedAt: new Date(),
          })
          .where(eq(generations.id, item.id));

        this.notify(item.id, { status: "completed", resultPath: result.resultPath });
      } else {
        await db
          .update(generations)
          .set({
            status: "failed",
            errorMessage: result.error ?? "Неизвестная ошибка",
          })
          .where(eq(generations.id, item.id));

        this.notify(item.id, { status: "failed", error: result.error });
      }

      this.queue.shift();
    }

    this.processing = false;
  }
}

// синглтон для Next.js server
declare global {
  // eslint-disable-next-line no-var
  var __generationQueue: GenerationQueue | undefined;
}

export const generationQueue: GenerationQueue =
  globalThis.__generationQueue ?? new GenerationQueue();

if (!globalThis.__generationQueue) {
  globalThis.__generationQueue = generationQueue;
}
