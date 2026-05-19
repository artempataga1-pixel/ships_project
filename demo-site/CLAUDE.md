# CLAUDE.md — Сайт «Братья Разумовские и Партнёры»

## Обязательно прочитать при старте

**Стек:** Next.js 16 + React + TypeScript + Tailwind CSS  
**Деплой:** Vercel CLI (без GitHub)  
**Цвет золота:** `#E4C753` (никаких других оттенков)

---

## Правила, агенты и скилы — читай всё автоматически

В рамках этого проекта ты ОБЯЗАН использовать все правила, агентов и скилы из глобальной папки пользователя (`~/.claude/`), а также из папки проекта (`.claude/`). Не жди, пока попросят — применяй сам.

### Глобальные правила (применяются всегда)
- `~/.claude/rules/стиль-общения.md` — обращение к пользователю, тон
- `~/.claude/rules/plan-do-verify.md` — Plan → Do → Verify на каждую задачу
- `~/.claude/rules/правила-поведения.md` — НЕ ВЫДУМЫВАЙ, всегда проверяй
- `~/.claude/rules/голосовой-ввод.md` — интерпретация голосового ввода
- `~/.claude/rules/агенты.md` — когда и какого агента запускать

### Глобальные скилы (автоматически)
- `commit` — коммит после каждого логического блока работы
- `docker` — если нужна контейнеризация
- `worktree` — для изолированной работы
- `tavily` — fallback при неудаче WebFetch

### Агенты проекта (в `.claude/agents/`)
- `nextjs-reviewer` — ревью Next.js кода после реализации каждого блока
- `e2e-tester` — E2E тесты UI после реализации секций
- `code-simplifier` — упрощение кода после завершения

### Скилы проекта (в `.claude/skills/`)
Все скилы из `.claude/skills/` — автоматически по назначению:
- `nextjs-shadcn` — компоненты shadcn/ui
- `frontend-design` — UI дизайн высокого качества
- `next-best-practices` — паттерны Next.js App Router
- `react-best-practices` — оптимизация React
- `nextjs-seo` — SEO оптимизация
- `go` — открыть в браузере и проверить UI
- `web-design-guidelines` — ревью UI по гайдлайнам
- `shadcn` — работа с shadcn компонентами

### Таблица — когда запускать агентов

| Ситуация | Агент/скилл |
|----------|-------------|
| Незнакомая/меняющаяся библиотека | `docs` агент |
| Актуальные API, имена моделей | `research` агент |
| Архитектура, план реализации | `Plan` агент |
| После реализации любого блока | `nextjs-reviewer` |
| Проверка UI в браузере | скилл `go` |
| E2E тестирование | `e2e-tester` |
| Поиск по кодовой базе (>3 запросов) | `Explore` агент |
| Веб-поиск | `research` агент (не напрямую!) |

---

## Контекст проекта

### О сайте
Премиальный одностраничный юридический лендинг. Эффект «власти и дороговизны бренда».  
Клиент должен думать: _«Эти люди работают только с серьёзными клиентами»._

### Исходные материалы (читать перед работой)
- [information/brothers.txt](information/brothers.txt) — биографии, кейсы, новости, статистика
- [information/dopinformation.txt](information/dopinformation.txt) — доп. требования к структуре
- [information/brothers.jpg](information/brothers.jpg) — Hero фото (оба вместе)
- [information/oleg.jpg](information/oleg.jpg) — фото Олега
- [information/konstantin.jpg](information/konstantin.jpg) — фото Константина
- [information/logo.png](information/logo.png) — логотип
- [information/statistics.png](information/statistics.png) — референс счётчика статистики
- [information/mobilemenu.png](information/mobilemenu.png) — референс мобильного меню
- [information/coursor.png](information/coursor.png) — референс курсор-анимации

### План проекта
**ГЛАВНЫЙ ДОКУМЕНТ:** [tmp/plans/plan.md](tmp/plans/plan.md)  
Читать перед каждым шагом! Там шаги 0-6, все детали, критические требования и чеклист готовности.

---

## Критически важные детали (не забыть!)

- **Офис — ТОЛЬКО МОСКВА**, центр: `[55.751244, 37.618423]` (заглушка до уточнения)
- **Цвет золота — `#E4C753`** (не `#B8960C` и не другой!)
- **Раздел "Философия" — НЕТ** (убран по решению клиента)
- **Шрифты — ЛОКАЛЬНО** в `public/fonts/` (не CDN!)
- **Новости — из brothers.txt**, ровно 6 штук
- **Кейсы — 4 дела** (3 из brothers.txt + 1 налоговый придумать)
- **Яндекс.Карты API 2.1** — JavaScript API и HTTP Геокодер (бесплатный)
- **Мобильное меню** — по стилю referenс mobilemenu.png, sticky при скролле
- **CursorBlob** — CSS-подход, золотой `#E4C753`, opacity 0.3-0.5, не на touch-устройствах
- **Параллакс в Hero** — useScroll + useTransform из framer-motion, сдвиг -30%

---

## Структура файлов (целевая)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── layout/      (Navbar, MobileMenu, Footer, StickyCtaButton)
│   ├── sections/    (все 13 секций сайта)
│   └── ui/          (CursorBlob, StatCounter, YandexMap, PartnerAvatar и др.)
├── hooks/           (useIntersectionObserver, useCountUp)
└── types/index.ts
```

Публичные ассеты: `public/images/` (фото), `public/fonts/` (шрифты)

---

## Порядок разработки

По плану в [tmp/plans/plan.md](tmp/plans/plan.md):  
Шаг 1 → инициализация | Шаг 2 → конфигурация | Шаг 3 → структура файлов | Шаг 4 → секции | Шаг 5 → тех. детали | Шаг 6 → SEO + деплой

После каждого шага: **коммит** (скилл `commit`) + **ревью** (`nextjs-reviewer`).
