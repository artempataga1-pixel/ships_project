import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, initializeDatabase } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDailyUsage, getDailyLimit } from "@/lib/limits";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  await initializeDatabase();

  const userId = session.user.id;
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const used = await getDailyUsage(userId);
  const limit = getDailyLimit();

  return NextResponse.json({
    email: user?.email,
    name: user?.name,
    plan: "Free",
    dailyUsed: used,
    dailyLimit: limit,
  });
}
