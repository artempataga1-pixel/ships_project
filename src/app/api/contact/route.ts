import { NextRequest, NextResponse } from 'next/server'
import { PRACTICE_OPTIONS } from '@/constants/content/contacts'

/* Экранирование для Telegram HTML parse_mode: достаточно &, <, >
   (порядок важен — сначала &). */
function escapeHtml(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function formatMoscowTime(): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())
}

/* Номер заявки из московской даты: #ДДММ-ЧЧММ (например #1607-2143).
   Счётчика в serverless нет, поэтому номер — из момента поступления. */
function leadNumber(): string {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return `#${get('day')}${get('month')}-${get('hour')}${get('minute')}`
}

/* Rate-limit по IP: best-effort — Map живёт в памяти warm-инстанса serverless-функции,
   при холодном старте или параллельном инстансе счётчик чистый. От двойных кликов
   и примитивных ботов защищает, от целевого спама — нет (тогда Turnstile/Redis). */
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5
const hits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t > RATE_WINDOW_MS)) hits.delete(key)
    }
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX) return true
  recent.push(now)
  hits.set(ip, recent)
  return false
}

async function sendTelegram(token: string, chatId: string, text: string): Promise<boolean> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
        signal: AbortSignal.timeout(7_000),
      })
      if (res.ok) return true
      console.error(`[contact] Telegram ответил ошибкой (chat ${chatId}, попытка ${attempt}):`, await res.text())
    } catch (err) {
      console.error(`[contact] сбой запроса к Telegram (chat ${chatId}, попытка ${attempt}):`, err)
    }
    if (attempt === 1) await new Promise((r) => setTimeout(r, 700))
  }
  return false
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : ''
  const practice = typeof body.practice === 'string' ? body.practice.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const honeypot = typeof body.website === 'string' ? body.website.trim() : ''

  /* Honeypot: людям поле не видно; заполнено — значит бот. Отвечаем фейковым
     успехом, чтобы не подсказывать спамеру, что его вычислили. */
  if (honeypot) {
    console.warn('[contact] honeypot сработал, заявка отброшена')
    return NextResponse.json({ ok: true })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  const valid =
    name.length > 0 &&
    name.length <= 200 &&
    phone.length === 11 &&
    (phone[0] === '7' || phone[0] === '8') &&
    message.length <= 2000 &&
    (practice === '' || PRACTICE_OPTIONS.includes(practice))
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 400 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIdsRaw = process.env.TELEGRAM_CHAT_IDS
  if (!token || !chatIdsRaw) {
    console.error('[contact] не заданы TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_IDS')
    return NextResponse.json({ ok: false, error: 'config' }, { status: 500 })
  }

  /* Резервная копия заявки в логах (Vercel → Logs) — пишем ДО отправки,
     чтобы данные не потерялись, даже если Telegram недоступен. */
  console.log('[contact] заявка:', JSON.stringify({ name, phone, practice, message, ts: new Date().toISOString() }))

  const normalizedPhone = '+7' + phone.slice(1)
  const text = [
    `🔔 <b>Новая заявка ${leadNumber()}</b>`,
    '',
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Телефон:</b> ${normalizedPhone}`,
    `<b>Направление:</b> ${practice ? escapeHtml(practice) : 'не указано'}`,
    `<b>Сообщение:</b> ${message ? escapeHtml(message) : '—'}`,
    '',
    `<i>${formatMoscowTime()} (МСК)</i>`,
  ].join('\n')

  const chatIds = chatIdsRaw.split(',').map((s) => s.trim()).filter(Boolean)
  const results = await Promise.allSettled(chatIds.map((id) => sendTelegram(token, id, text)))
  const delivered = results.some((r) => r.status === 'fulfilled' && r.value)

  if (!delivered) {
    return NextResponse.json({ ok: false, error: 'telegram' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
