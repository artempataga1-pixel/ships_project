import { db } from "./db";
import { generations } from "./db/schema";
import { and, eq, gte, ne, sql } from "drizzle-orm";

const DAILY_LIMIT = parseInt(process.env.DAILY_GENERATION_LIMIT ?? "5", 10);

function getTodayTimestamp(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor(today.getTime() / 1000);
}

// Считаем не отдельную таблицу, а все генерации сегодня кроме failed
// Так провальные генерации автоматически не списываются
export async function getDailyUsage(userId: string): Promise<number> {
  const todayStart = getTodayTimestamp();
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(generations)
    .where(
      and(
        eq(generations.userId, userId),
        gte(generations.createdAt, new Date(todayStart * 1000)),
        ne(generations.status, "failed")
      )
    );
  return rows[0]?.count ?? 0;
}

export async function canGenerate(userId: string): Promise<boolean> {
  const used = await getDailyUsage(userId);
  return used < DAILY_LIMIT;
}

export function getDailyLimit(): number {
  return DAILY_LIMIT;
}
