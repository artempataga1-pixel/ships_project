@AGENTS.md

# AI Photo Studio — контекст проекта

## Что это

Веб-приложение для стилизации фотографий через Google Gemini API. Пользователь загружает 1–5 фото, выбирает стиль из 10 пресетов, получает стилизованное изображение.

## Детальный план

Полный план с архитектурой, схемой БД, структурой файлов и чеклистом верификации:
→ `tmp/plans/plan.md`

## Технологический стек

- **Next.js 16.2 LTS** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS + shadcn/ui**
- **SQLite + Drizzle ORM + better-sqlite3**
- **NextAuth.js v5 Beta** (credentials: email + пароль)
- **@google/genai** — модель `gemini-2.0-flash-exp` (бесплатная, image-to-image)
- **nodemailer** — восстановление пароля через Ethereal Mail
- **sharp** — обработка изображений
- **bun** — пакетный менеджер (не npm)

## Важные решения Next.js 16

- `proxy.ts` вместо `middleware.ts` (middleware deprecated в v16)
- `params` и `searchParams` — только **async**
- `cookies()`, `headers()` — только **async**

## Что уже сделано

1. Репозиторий очищен от старого кода
2. Новый Next.js 16 проект создан в `ai-photo-studio/`
3. Установлены скилы и агенты из `laguagu/claude-code-nextjs-skills` в `.claude/`
4. Настроены MCP серверы: `next-devtools`, `ai-elements` (`.mcp.json`)
5. bun установлен (v1.3.14)
6. **[ШАГ 1 ЗАВЕРШЁН]** Все зависимости установлены, shadcn инициализирован
7. **[ШАГ 2 ЗАВЕРШЁН]** База данных создана и применена
8. **[ШАГ 3 ЗАВЕРШЁН]** Аутентификация — NextAuth v5, register/forgot/reset-password, proxy.ts

### Детали шага 1

**Зависимости установлены** (через npm — bun 1.3.14 имеет баг SSL/CRL на Windows):
- drizzle-orm, better-sqlite3, drizzle-kit
- next-auth@beta (v5.0.0-beta.31)
- @google/genai, bcryptjs, nodemailer, sharp, uuid, next-themes
- @base-ui/react (используется shadcn вместо @radix-ui)
- class-variance-authority, clsx, tailwind-merge, lucide-react, zod
- react-hook-form, @hookform/resolvers

**ВАЖНО:** bun 1.3.14 не работает для `bun add` новых пакетов из-за `CRYPT_E_REVOCATION_OFFLINE` (CRL проверка SSL на Windows). Использовать **npm install** для установки новых пакетов. `bun run` работает нормально.

**shadcn инициализирован:**
- Style: `base-nova` (использует `@base-ui/react`, НЕ `@radix-ui`)
- Компоненты в `src/components/ui/`: button, input, label, card, badge, skeleton, progress, sonner, form, dialog, dropdown-menu, separator, avatar, sheet
- Тема в `globals.css`: dark (#121212 фон, #1E1E1E карточки, #007AFF акцент)

**package.json скрипты добавлены:**
- `db:push`, `db:generate`, `db:studio`

**.env создан** с шаблоном (нужно заполнить NEXTAUTH_SECRET и GEMINI_API_KEY)

### Детали шага 2

**Файлы созданы:**
- `src/lib/db/schema.ts` — таблицы users, generations, passwordResetTokens
- `src/lib/db/index.ts` — Drizzle клиент с better-sqlite3, абсолютный путь через `process.cwd()`
- `drizzle.config.ts` — конфиг для drizzle-kit (dialect: sqlite, path: ./data/app.db)

**БД:** `data/app.db` создана, все три таблицы применены через `bun run db:push`

**ВАЖНО:** better-sqlite3 требует нативных биндингов. На этой машине (Node.js v24.15.0) уже выполнен `npm rebuild better-sqlite3`. При первом запуске на новой машине — повторить.

### Детали шага 3

**Файлы созданы:**
- `src/auth.ts` — NextAuth v5 config: Credentials provider, bcrypt, callbacks jwt+session (передаёт userId)
- `src/types/next-auth.d.ts` — расширение Session и JWT типов (добавлен `id: string`)
- `src/proxy.ts` — защита роутов через NextAuth v5 `auth()` HOF; защищены `/`, `/history`, `/account`
- `src/lib/email.ts` — nodemailer + Ethereal автоконфиг; ссылка на письмо выводится в консоль
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- `src/app/api/auth/register/route.ts` — регистрация (bcrypt hash, проверка дубля)
- `src/app/api/auth/forgot-password/route.ts` — генерация токена (инвалидирует старые), отправка письма
- `src/app/api/auth/reset-password/route.ts` — проверка токена (expiry + usedAt), обновление хэша
- `src/app/(auth)/layout.tsx` — центрированный layout для auth-страниц
- `src/app/(auth)/login/page.tsx` — форма входа (react-hook-form + zod, signIn из next-auth/react)
- `src/app/(auth)/register/page.tsx` — регистрация + auto-signIn после успеха
- `src/app/(auth)/forgot-password/page.tsx` — форма запроса ссылки
- `src/app/(auth)/reset-password/page.tsx` + `ResetPasswordForm.tsx` — сброс пароля (Suspense + useSearchParams)

**Обновлены:**
- `src/app/layout.tsx` — добавлен `SessionProvider`, класс `dark` на `<html>`, metadata на русском
- `.env` — `NEXTAUTH_SECRET` уже сгенерирован и заполнен

## Что предстоит сделать

Смотри детальный план → `tmp/plans/plan.md`

**Следующий шаг: ШАГ 4 — UI Shell**

Коротко — оставшиеся шаги:
3. **[ГОТОВО]** Аутентификация — NextAuth v5 credentials, register/forgot-password/reset-password
4. **[СЛЕДУЮЩИЙ]** UI Shell — ThemeProvider (dark-first), NavBar, layout
5. DropZone — drag-and-drop (JPG/PNG, до 10MB, до 5 файлов)
6. Gemini — src/lib/gemini.ts с retry 3 раза + API /api/generate
7. Главный экран — StyleGrid (10 пресетов), прогресс-бар, результат
8. История — /history, Re-generate
9. Аккаунт — /account с лимитом (50 фото накопительно)
10. Полировка — mobile, error states, пустые состояния

## Ключевые бизнес-правила

- Только Free план в MVP
- Лимит: 50 выходных фото (накопительный, не сбрасывается)
- 1 выходное фото = 1 единица лимита
- Синхронная генерация (прогресс-бар, ждём ответа)
- Re-generate: немедленный запуск с теми же параметрами
- Файлы: локально в /uploads/inputs/ и /uploads/results/
- Нет скачивания, нет удаления аккаунта в MVP

## Структура проекта

```
ai-photo-studio/
├── src/
│   ├── app/
│   │   ├── (auth)/     — login, register, forgot-password, reset-password
│   │   ├── (app)/      — защищённые: /, /history, /account
│   │   └── api/        — auth/*, generate, history, account, uploads
│   ├── components/     — NavBar, DropZone, StyleGrid, GenerationResult, HistoryCard
│   ├── lib/
│   │   ├── db/         — schema.ts, index.ts (Drizzle)
│   │   ├── gemini.ts
│   │   ├── email.ts
│   │   ├── upload.ts
│   │   └── limits.ts
│   ├── auth.ts         — NextAuth config
│   └── proxy.ts        — защита роутов (НЕ middleware.ts — deprecated в Next.js 16)
├── .claude/            — agents/, skills/ (nextjs-reviewer, e2e-tester и др.)
├── uploads/            — в .gitignore
├── tmp/plans/plan.md   — детальный план
└── .mcp.json           — next-devtools, ai-elements
```

## Переменные окружения (.env)

```
NEXTAUTH_SECRET=<уже заполнен>
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=<нужно заполнить — aistudio.google.com, Get API key, бесплатно>
GENERATION_LIMIT=50
```
