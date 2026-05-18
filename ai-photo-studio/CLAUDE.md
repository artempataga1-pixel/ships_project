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
9. **[ШАГ 4 ЗАВЕРШЁН]** UI Shell — ThemeProvider, NavBar, ThemeToggle, LimitBadge, (app) layout, заглушки страниц
10. **[ШАГ 5 ЗАВЕРШЁН]** Загрузка файлов — upload.ts, API /api/uploads/[...path], DropZone компонент
11. **[ШАГ 6 ЗАВЕРШЁН]** Gemini интеграция — gemini.ts, limits.ts, API POST /api/generate

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

### Детали шага 4

**Файлы созданы:**
- `src/components/ThemeToggle.tsx` — "use client", useTheme, иконки Sun/Moon; Button имеет `className="relative"` (нужно для absolute Moon)
- `src/components/LimitBadge.tsx` — "use client", fetch `/api/account` → badge X/50; при ошибке (API ещё не готов) не показывается; cancel-флаг на unmount
- `src/components/NavBar.tsx` — "use client" (usePathname), sticky header, логотип Camera + "AI Photo Studio", ссылки Генератор/История/Аккаунт, ThemeToggle + LimitBadge
- `src/app/(app)/layout.tsx` — обёртка NavBar + main для защищённых страниц
- `src/app/(app)/page.tsx` — заглушка главной (шаг 7 заменит)
- `src/app/(app)/history/page.tsx` — заглушка (шаг 8 заменит)
- `src/app/(app)/account/page.tsx` — заглушка (шаг 9 заменит)

**Обновлён:**
- `src/app/layout.tsx` — добавлен `ThemeProvider` (next-themes, defaultTheme="dark", enableSystem=false, disableTransitionOnChange), убран хардкоженный класс `dark`, добавлен `suppressHydrationWarning` на `<html>`

**Удалён:**
- `src/app/page.tsx` — конфликтовал с `src/app/(app)/page.tsx`

**ВАЖНО:** `LimitBadge` вызывает `/api/account` который будет создан только на шаге 9. До тех пор badge просто не отображается (это ОК — intentional).

### Детали шага 5

**Файлы созданы:**
- `src/lib/upload.ts` — server-side утилиты: `validateFile`, `saveInputFiles`, `saveResultFile`, `resolveUploadPath`, `uploadFileExists`
- `src/app/api/uploads/[...path]/route.ts` — GET route handler для выдачи файлов из `/uploads/` с проверкой auth + userId
- `src/components/DropZone.tsx` — "use client" компонент: drag-and-drop, превью (URL.createObjectURL с cleanup через useEffect), удаление, до 5 файлов, валидация MIME+размер, кнопка галереи для мобильных

**Структура хранения файлов:**
- Входные: `uploads/inputs/{userId}/{generationId}/{uuid}.jpg|.png`
- Результаты: `uploads/results/{userId}/{generationId}.png`
- Относительные пути хранятся в `generations.sourceImagePaths` (JSON-массив) и `generations.resultImagePath`
- Отдаются через `/api/uploads/{relativePath}` с авторизацией

**Безопасность (важно для шага 6):**
- `upload.ts` проверяет магические байты файла (PNG: `89 50 4E 47 0D 0A 1A 0A`, JPEG: `FF D8 FF`) — обходит MIME spoofing
- Оба `userId` и `generationId` проходят `isSafeSegment()` (нет `..`, `/`, `\0`)
- Итоговый путь проверяется через `resolve()` + `startsWith(UPLOADS_ROOT + sep)`
- Route handler валидирует структуру пути: `inputs` = 4 сегмента, `results` = 3 сегмента
- `resolveUploadPath()` возвращает `null` при выходе за UPLOADS_ROOT — защита от path traversal

### Детали шага 6

**Файлы созданы:**
- `src/lib/limits.ts` — `checkAndIncrementLimit(userId)` → boolean (синхронный, атомарный UPDATE), `decrementGenerations(userId)` (синхронный, откат при ошибке), `GENERATION_LIMIT` константа с NaN-guard
- `src/lib/gemini.ts` — `stylizeImage(images: ImageInput[], styleId, userPrompt?)` → Buffer PNG; retry 3x с задержкой 1s/2s; `isRetriable` пропускает 400/401/403; все 10 стилей в `STYLE_PROMPTS`
- `src/app/api/generate/route.ts` — POST FormData (files[], style, prompt, aspectRatio): атомарный check лимита → saveInputFiles → Gemini → saveResultFile → completed → `{ generationId, resultUrl }`; при ошибке — decrementGenerations + status=failed

**Ключевые особенности limits.ts (важно — СИНХРОННЫЙ, не async):**
- `checkAndIncrementLimit` и `decrementGenerations` — НЕ async функции (better-sqlite3 синхронный)
- В route.ts вызывать без `await`: `const allowed = checkAndIncrementLimit(userId)` 
- Инкремент происходит ДО вызова Gemini; при ошибке вызывается `decrementGenerations`
- Атомарный UPDATE: `UPDATE users SET totalGenerations = totalGenerations + 1 WHERE id = ? AND totalGenerations < LIMIT` — returns `{ changes: number }`

**API /api/generate — детали:**
- Принимает: `FormData` с полями `files` (несколько File через `formData.append('files', file)`), `style` (string из VALID_STYLES), `prompt` (string, max 500 символов), `aspectRatio` ('1:1'|'9:16'|'16:9')
- Возвращает: `{ generationId: string, resultUrl: string }` — resultUrl = `/api/uploads/results/{userId}/{generationId}.png`
- Ошибки: 401 (не авторизован), 400 (нет файлов/стиль), 403 (лимит исчерпан), 500 (Gemini ошибка)
- MIME type определяется по магическим байтам буфера (`detectMime` внутри route.ts), не по `file.type`

**ВАЖНО для шага 7 (главный экран):**
- `DropZone` — управляемый компонент: `files: File[]` + `onChange: (files: File[]) => void` пропсы
- При сабмите: `const fd = new FormData(); files.forEach(f => fd.append('files', f)); fd.append('style', style)` → `fetch('/api/generate', { method: 'POST', body: fd })`
- Прогресс-бар: indeterminate (`<Progress />` без value) пока идёт запрос — синхронный, нет стриминга
- После успеха: отобразить `<img src={resultUrl}>` — картинка доступна сразу через `/api/uploads/...`
- При лимите (403): заблокировать кнопку Generate + показать сообщение

## Что предстоит сделать

Смотри детальный план → `tmp/plans/plan.md`

**Следующий шаг: ШАГ 7 — Главный экран (Generator)**

Коротко — оставшиеся шаги:
3. **[ГОТОВО]** Аутентификация — NextAuth v5 credentials, register/forgot-password/reset-password
4. **[ГОТОВО]** UI Shell — ThemeProvider (dark-first), NavBar, layout
5. **[ГОТОВО]** Загрузка файлов — upload.ts, API /api/uploads, DropZone компонент
6. **[ГОТОВО]** Gemini — `src/lib/gemini.ts` с retry 3 раза + `src/lib/limits.ts` + API `POST /api/generate`
7. **[СЛЕДУЮЩИЙ]** Главный экран — StyleGrid (10 пресетов), прогресс-бар, результат
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
