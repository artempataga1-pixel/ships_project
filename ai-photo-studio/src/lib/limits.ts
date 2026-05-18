import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, lt, and, sql } from 'drizzle-orm'

export const GENERATION_LIMIT = (() => {
  const val = parseInt(process.env.GENERATION_LIMIT ?? '50', 10)
  if (isNaN(val) || val <= 0) throw new Error('GENERATION_LIMIT must be a positive integer')
  return val
})()

// Атомарный check + increment одним UPDATE — без race condition.
// true = лимит не достигнут, счётчик инкрементирован.
// false = лимит уже достигнут, ничего не изменено.
export function checkAndIncrementLimit(userId: string): boolean {
  const result = db
    .update(users)
    .set({ totalGenerations: sql`${users.totalGenerations} + 1` })
    .where(and(eq(users.id, userId), lt(users.totalGenerations, GENERATION_LIMIT)))
    .run()
  return result.changes > 0
}

// Откат инкремента при ошибке генерации (не опускает ниже 0).
export function decrementGenerations(userId: string): void {
  db.update(users)
    .set({
      totalGenerations: sql`CASE WHEN ${users.totalGenerations} > 0 THEN ${users.totalGenerations} - 1 ELSE 0 END`,
    })
    .where(eq(users.id, userId))
    .run()
}
