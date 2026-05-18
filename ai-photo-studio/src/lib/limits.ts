import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export const GENERATION_LIMIT = parseInt(process.env.GENERATION_LIMIT ?? '50', 10)

export async function checkLimit(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { totalGenerations: true },
  })
  if (!user) return false
  return user.totalGenerations < GENERATION_LIMIT
}

export async function incrementGenerations(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ totalGenerations: sql`${users.totalGenerations} + 1` })
    .where(eq(users.id, userId))
}
