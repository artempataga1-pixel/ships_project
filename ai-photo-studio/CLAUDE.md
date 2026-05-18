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

## Что предстоит сделать

Смотри детальный план → `tmp/plans/plan.md`

**Следующий шаг: ШАГ 2 — База данных**

Коротко — оставшиеся шаги:
2. **[СЛЕДУЮЩИЙ]** БД — schema.ts (users, generations, passwordResetTokens) + drizzle.config.ts + `bun run db:push`
3. Аутентификация — NextAuth v5 credentials, register/forgot-password/reset-password
4. UI Shell — ThemeProvider (dark-first), NavBar, layout
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
NEXTAUTH_SECRET=       # openssl rand -hex 32
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=        # aistudio.google.com — Get API key (бесплатно, без карты)
GENERATION_LIMIT=50
```
