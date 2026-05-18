import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, passwordResetTokens } from "@/lib/db/schema"
import { eq, and, isNull } from "drizzle-orm"
import { randomBytes } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 })
    }

    const { email } = parsed.data

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    // Всегда возвращаем success — не раскрываем наличие email в системе
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Инвалидируем все старые неиспользованные токены пользователя
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          isNull(passwordResetTokens.usedAt)
        )
      )

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // +1 час

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    })

    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
