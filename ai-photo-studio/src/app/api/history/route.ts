import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { generations } from '@/lib/db/schema'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
  }
  const userId = session.user.id

  const rows = await db
    .select()
    .from(generations)
    .where(eq(generations.userId, userId))
    .orderBy(desc(generations.createdAt))

  const items = rows.map((row) => {
    let sourcePaths: string[] = []
    if (row.sourceImagePaths) {
      try {
        const parsed: unknown = JSON.parse(row.sourceImagePaths)
        if (Array.isArray(parsed)) {
          sourcePaths = parsed.filter((x): x is string => typeof x === 'string')
        }
      } catch {
        // повреждённые данные в БД — не валим весь endpoint
      }
    }
    return {
      id: row.id,
      status: row.status,
      style: row.style,
      prompt: row.prompt,
      aspectRatio: row.aspectRatio,
      sourceImagePaths: sourcePaths,
      sourceImageUrls: sourcePaths.map((p) => `/api/uploads/${p}`),
      resultImageUrl: row.resultImagePath ? `/api/uploads/${row.resultImagePath}` : null,
      createdAt: row.createdAt?.toISOString() ?? null,
      completedAt: row.completedAt?.toISOString() ?? null,
    }
  })

  return NextResponse.json(items)
}
