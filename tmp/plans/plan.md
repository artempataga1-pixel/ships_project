# План: сайт-визуал «ШУМСКАЯ И ПАРТНЁРЫ»

## Context

Проект `project-yuriki` — многостраничный десктопный сайт-визуал для юридической компании «Шумская и Партнёры». Главная задача: передать премиальный, технологичный имидж через анимации, а не контент. Стек: Next.js 16 + Tailwind v4 + GSAP 3 + Lenis. Проект с нуля (только `reference/` и `tmp/` в корне). Мобильная адаптация — отдельный этап.

---

## Итоги интервью (50 вопросов)

| Параметр | Решение |
|----------|---------|
| Разрешение | 1440px базовое |
| Header | Одинаковый на всех страницах; только логотип (без текста); CTA-кнопка «Связаться» |
| Пункты меню | Title Case; активный пункт — постоянный фонарь |
| Footer | Контакты + навигация + соцсети-заглушки |
| Page transitions | Fade |
| Главная + О нас | Совмещены на `/` (нет отдельного `/about`) |
| Hero | Split layout — видео слева в своих пропорциях, текст справа; текст уезжает вверх+fade, появляется фраза; CTA «Узнать больше» → #about |
| Logo intro | Только на `/`, при каждом открытии |
| Логотип | `reference/logotip.png` → трассировать в SVG перед стартом |
| Шрифты | Определить из `logo gide.pdf`; fallback: Unbounded ExtraBold (h1) + Golos Text (остальное) |
| Цвет обводки карточек | Подобрать по `kartochki.jpg` |
| Scroll | Свободный плавный (Lenis, без snap) |
| Анимации блоков | opacity + translateY + blur (RevealOnScroll) |
| SplitText | Строки выезжают снизу вверх (mask: lines) |
| StatCounter | Только на главной (секция «О нас»), цифры — заглушки |
| Parallax | Только ambient-видео на внутренних страницах |
| Фонарь | Конус вниз под пунктом меню; hover + постоянный для активного |
| Ambient video opacity | 0.10–0.15 |
| Практики | 4–6, hover: подсветка + мини-лист 2–3 продуктов справа |
| Команда | 3–5 карточек, silhouette-заглушка |
| Кейсы | 4 карточки, цифры придумать |
| Медиа | 4–6 крупных карточек, лого издания + заголовок + дата, превью — градиент |
| Польза | 3 карточки + кнопка «Скачать» (ненастоящая) |
| Контакты | Форма (имя, телефон, сообщение, выбор практики) + реквизиты; «Спасибо» после отправки |
| Карта | Нет |
| Соцсети | В footer, href="#" заглушки |

---

## Файлы в reference/

| Тип | Файлы |
|-----|-------|
| Видео | dama.MP4, glavnaya.MP4, infograf1-4.MP4, pesok.MP4, time.MP4 |
| Фоны | fon1.jpg, fon2.jpg, fon21.jpg, fon22.jpg, fon3.jpg, fin23.jpg |
| Референсы | referens1.jpg, referens2.jpg, referens3.jpg, referens4.jpg, kartochki.jpg |
| Логотип | logotip.png (чёрный лого на светло-сером фоне), logo.jpg |
| Брендбук | logo gide.pdf (~14.3 MB) |
| Шрифтов нет | Через next/font/google (без скачивания) |

**Логотип logotip.png** — изображение содержит геометрический символ + «ШУМСКАЯ И ПАРТНЁРЫ» + «Юридическая компания». Фон светло-серый, лого чёрное → на тёмном сайте нужна белая/светлая версия. Решение: `filter: invert(1)` + возможный brightness-tweaking, или трассировать в SVG белым цветом — SVG предпочтительнее для LogoIntro-анимации.

**Шрифт в логотипе** — на вид узкий bold-конденсированный гротеск (не Unbounded). Точное название — в `logo gide.pdf`. Если это Google Fonts → `next/font/google` (никаких ручных скачиваний не нужно — Next.js сам качает .woff2 при сборке и хостит локально). Если кастомный/платный → нужны .woff2 файлы.

---

## ⚠️ Обязательно перед началом работы

### 1. Изучить правила, агентов и скиллы

Прочитать свои инструкции: `C:\Users\Admin\.claude\CLAUDE.md` и все подключённые файлы (`rules/`, `skills/`). Знать когда и какого агента запускать — и не бояться их использовать. Цель: правильность через специализацию, а не скорость через самостоятельность.

| Когда | Агент |
|-------|-------|
| Незнакомая/изменившаяся библиотека | `docs` (через Context7) |
| Актуальные версии, API, endpoint-ы | `research` |
| После любого нетривиального шага | `code-reviewer` или `reviewer` |
| Обход кодовой базы > 3 запросов | `Explore` |
| E2E проверка в браузере | `e2e-tester` |

**Правило:** применять агентов проактивно, без ожидания просьбы.

### 2. Изучить demo-site перед стартом

Перед написанием любого кода — прочитать все 4 файла предыдущего аналогичного проекта. Там зафиксированы реальные баги, нюансы стека и способы решения.

| Файл | Что там |
|------|---------|
| `D:\IT\VS\demo-site\tmp\plans\plan.md` | Пошаговый план с секциями **⚠️ Нюансы** — главный источник. Tailwind v4, Lenis+GSAP sync, LogoIntro паттерн, scroll-padding-top баг |
| `D:\IT\VS\demo-site\tmp\plans\ui-fixes-plan.md` | 15 UI-багов и их фиксы: маска телефона, BottomNav IntersectionObserver, mix-blend-mode для логотипа, scroll-margin-top |
| `D:\IT\VS\demo-site\tmp\plans\new-changes.md` | LogoIntro переписан на animate()+refs, 3-колонная navbar, ScrollSnapper |
| `D:\IT\VS\demo-site\tmp\plans\research.md` | Референсы tutushkina.ru и salus.law, best practices юр. сайтов |

**Особое внимание:** секции **⚠️ Нюансы** в каждом шаге `plan.md` — там самое ценное.

### 3. Код-ревью после каждого шага

После завершения каждого шага — запустить `code-reviewer` агента для независимой проверки. Не говорить «готово» без прохождения ревью. Критические замечания — исправить до следующего шага.

### 4. Фиксировать нюансы в плане

Если в процессе работы столкнулся с неочевидной проблемой — записать её прямо в этот файл плана в секцию **⚠️ Нюансы** соответствующего шага. Формат: `Проблема: ... → Решение: ...`. Это превращает план в живой документ опыта.

### 5. Мобильная версия — не в этой фазе

Сайт только для десктопа (1440px). Никакой адаптивности, медиа-запросов под мобилку, touch-обработчиков. Всё это — отдельный этап.

---

## Пошаговый план

---

### Шаг 0: Подготовка медиафайлов и ресурсов

**Что делаем:**
- Читаем `logo gide.pdf` через Playwright — определяем точные названия шрифтов и цвет `--card-border-gold`
- Трассируем `logotip.png` в SVG белым цветом (Inkscape Auto-Trace или ручная работа); альтернатива: использовать PNG с `filter: invert(1)` в CSS
- Подключаем шрифты через **`next/font/google`** (никаких ручных скачиваний — Next.js сам получает .woff2 при сборке). Точные названия — из брендбука. Fallback до прочтения PDF: Unbounded + Golos Text
- Копируем файлы в `public/`:
  - `public/video/`: dama.MP4, infograf1-4.MP4
  - `public/images/backgrounds/`: fon1.jpg, fon2.jpg, fon21.jpg, fon22.jpg, fon3.jpg
  - `public/images/logo.svg` (результат трассировки)
- Проверить dama.MP4: кодек h264? Если нет — `ffmpeg -i dama.MP4 -c:v libx264 -crf 23 -preset fast -an -movflags +faststart public/video/dama.mp4`

**⚠️ Нюансы:**
- `logotip.png` — чёрный лого на светло-сером фоне. Простейшее решение: `filter: invert(1)` → лого становится белым, серый фон — тёмно-серым (почти сливается с `#262424`). Лучшее решение: SVG с `fill="white"` — нет серого артефакта, идеально масштабируется для LogoIntro
- Шрифты из `logo gide.pdf` — приоритет брендбуку. `next/font/google` не требует ручного скачивания: `import { FontName } from 'next/font/google'`
- Ambient-видео infograf1-4.MP4 нужно мутированное воспроизведение: проверить есть ли аудиодорожка (если есть — ffmpeg `-an`)

**✅ ВЫПОЛНЕНО — результаты:**
- Шрифты из брендбука: **Gilroy Extra Bold** (заголовки) + **Qanelas** (текст). Оба платные, не на Google Fonts, файлов нет → используем fallback: **Unbounded** + **Golos Text**
- Цвет фона подтверждён брендбуком: **#262424**
- Цвет обводки карточек (из kartochki.jpg): **#77634b** (тёмная бронза)
- `dama.mp4`: h264, без аудио, faststart ✓
- `infograf1-4.mp4`: аудио aac удалено ffmpeg, faststart добавлен ✓
- SVG логотип создан вручную по пиксельному анализу: `public/images/logo.svg` — символ «Ш+┐», fill="white". Достаточно для LogoIntro. Для продакшена — уточнить у клиента оригинальный SVG или заменить на `logotip.png` с `filter: invert(1)`

**Критерии проверки:**
- ✅ `public/` содержит все видео и изображения
- ✅ SVG читаемо отображается на тёмном фоне `#262424`

---

### Шаг 1: Инициализация Next.js проекта

**Что делаем:**
```bash
cd D:\IT\VS\project-yuriki
npx create-next-app@16 . --typescript --tailwind --app --src-dir --no-import-alias
npm install gsap@3.15.0 @gsap/react@2.1.2 lenis@1.3.25
```
- `next.config.ts` — настройка images.formats

**Ключевые детали:**
```ts
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}
```

**⚠️ Нюансы:**
- Next.js 16 создаёт Tailwind v4 из коробки — конфиг через `@theme` в globals.css, НЕ через `tailwind.config.ts`
- Если `create-next-app` создаст `tailwind.config.ts` — оставить, но не редактировать (Tailwind v4 читает `@theme` в CSS)
- Node.js >= 20 обязательно
- Turbopack включён по умолчанию для dev — это нормально
- Проблема: `create-next-app . ` не работает в непустой папке (есть public/, reference/, tmp/) → Решение: создать в project-yuriki-init, скопировать файлы вручную, npm install
- `--no-import-alias` не срабатывает (create-next-app добавляет `paths: { "@/*": ["./src/*"] }`) → оставить! Убирать `@/` алиас нецелесообразно — длинные относительные пути хуже
- `tsconfig.json target` обновлён ES2017 → ES2022
- `lang="ru"` в layout.tsx обязательно
- Временную папку project-yuriki-init удалить после завершения проекта

**✅ ВЫПОЛНЕНО — результаты:**
- Next.js 16.2.9 + TypeScript + Tailwind v4 + App Router
- gsap@3.15.0, @gsap/react@2.1.2, lenis@1.3.25 установлены
- next.config.ts: images.formats ['avif', 'webp']
- tsc --noEmit → 0 ошибок; npm run build → success

**Критерии проверки:**
- ✅ `npm run dev` стартует без ошибок (1.3s)
- ✅ `tsc --noEmit` → 0 ошибок

---

### Шаг 2: CSS-конфигурация, шрифты, палитра

**Что делаем:**
- `src/app/globals.css` — CSS-переменные + `@theme` Tailwind v4
- `src/app/layout.tsx` — подключение шрифтов через `next/font/google`

**Ключевые детали:**
```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-bg: #262424;
  --color-white: #ffffff;
  --color-accent-cold: rgba(170, 210, 255, 0.9);
  --color-card-border: /* hex определить по logo gide.pdf / kartochki.jpg */;

  --font-heading: var(--font-heading-var), sans-serif;
  --font-body: var(--font-body-var), sans-serif;
}

:root {
  --grad-brand: linear-gradient(180deg, #2e2e2e 0%, #cbcbcb 50%, #2e2e2e 100%);
}

body {
  background-color: #262424;
  color: #ffffff;
}
```

```ts
// layout.tsx — шрифты через next/font/google (ручное скачивание не нужно)
import { Unbounded, Golos_Text } from 'next/font/google'
// ⚠️ Если брендбук указывает другие шрифты — заменить здесь

const heading = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: '800',
  variable: '--font-heading-var',
})
const body = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-body-var',
})
// <html className={`${heading.variable} ${body.variable}`}>
```

**⚠️ Нюансы:**
- `next/font/google` скачивает .woff2 автоматически при `npm run build` и хостит локально — не нужно ничего скачивать вручную
- Tailwind v4: `@theme` вместо `theme.extend`. Цвета — `--color-*`, шрифты — `--font-*`
- Точные шрифты из `logo gide.pdf` — приоритет. Если не на Google Fonts → `next/font/local` + .woff2 файлы

**✅ ВЫПОЛНЕНО — результаты:**
- `globals.css`: @theme с --color-bg, --color-white, --color-accent-cold, --color-card-border, --font-heading, --font-body; :root с --grad-brand; body с фоном #262424 и font-family; [data-reveal] { will-change: transform }
- `layout.tsx`: Unbounded 800 + Golos_Text 400/500/600 через next/font/google, оба с subsets latin+cyrillic и display: swap; классы --font-heading-var / --font-body-var на html
- tsc --noEmit → 0 ошибок; npm run build → success

**Критерии проверки:**
- ✅ `npm run dev` — нет ошибок по шрифтам (build success)
- Заголовок отображается шрифтом из брендбука (проверяется визуально на следующих шагах)

---

### Шаг 3: GSAP + Lenis + SmoothScrollProvider

**Что делаем:**
- `src/lib/gsap.ts` — регистрация плагинов
- `src/components/layout/SmoothScrollProvider.tsx` — Lenis + GSAP ticker sync

**Ключевые детали:**
```ts
// src/lib/gsap.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}
export { gsap, ScrollTrigger, SplitText }
```

```tsx
// SmoothScrollProvider.tsx — 'use client'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import { gsap } from '@/lib/gsap'
import { useRef, useEffect } from 'react'
import type { LenisRef } from 'lenis/react'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false }}>
      {children}
    </ReactLenis>
  )
}
```

**⚠️ Нюансы:**
- `autoRaf: false` обязательно — иначе двойной requestAnimationFrame
- Проблема: `autoRaf` как прямой проп задепрекейчен в lenis@1.3.25 → Решение: передавать только через `options={{ autoRaf: false }}`, иначе TypeScript warning
- `gsap.ticker.lagSmoothing(0)` — предотвращает накопление задержки при неактивной вкладке
- Проблема: `lagSmoothing(0)` в `useEffect` семантически неверно (глобальная настройка тикера, не привязана к монтированию компонента) → Решение: держать в `src/lib/gsap.ts` рядом с регистрацией плагинов внутри `if (typeof window !== 'undefined')`
- Плагины регистрировать только на клиенте (`typeof window !== 'undefined'`)
- ScrollTrigger.scrollerProxy НЕ нужен с Lenis 1.x
- В Lenis 1.x через ReactLenis ref доступ к lenis через `lenisRef.current?.lenis`
- GSAP ticker передаёт `time` в секундах, `Lenis.raf()` ожидает миллисекунды → `time * 1000`; без комментария неочевидно

**Критерии проверки:**
- Страница плавно скроллится, нет рывков
- В DevTools нет ошибок про несколько регистраций GSAP

---

### Шаг 4: Типы и константы контента

**Что делаем:**
- `src/types/content.ts` — все TypeScript-типы
- `src/constants/nav.ts` — массив навигации
- `src/constants/content/*.ts` — контент по страницам (home, team, practice, cases, media, benefit, contacts)

**Ключевые детали:**
```ts
// nav.ts
export const NAV_ITEMS = [
  { label: 'О нас', href: '/#about' },
  { label: 'Команда', href: '/team' },
  { label: 'Практики', href: '/practice' },
  { label: 'Кейсы', href: '/cases' },
  { label: 'Медиа', href: '/media' },
  { label: 'Польза', href: '/benefit' },
  { label: 'Контакты', href: '/contacts' },
]

// home.ts — цифры достижений
export const STATS = [
  { value: 2009, label: 'год основания', suffix: '' },
  { value: 94, label: 'выигранных дел', suffix: '%' },
  { value: 15, label: 'млрд ₽ защищено', suffix: '+' },
]

// practice.ts — 5 практик
export const PRACTICES = [
  { title: 'Банкротство', products: ['Банкротство физлиц', 'Банкротство юрлиц'] },
  { title: 'Субсидиарная ответственность', products: ['Защита директора', 'Взыскание'] },
  { title: 'Корпоративные споры', products: ['M&A споры', 'Защита акционеров'] },
  { title: 'Налоговые споры', products: ['Оспаривание доначислений', 'Налоговая реструктуризация'] },
  { title: 'Уголовно-правовая защита', products: ['Защита бизнеса', 'Экономические преступления'] },
]
```

**Критерии проверки:**
- `tsc --noEmit` → 0 ошибок

---

### Шаг 5: Layout — Header + Footer

**Что делаем:**
- `src/app/layout.tsx` — подключает SmoothScrollProvider, Header, Footer
- `src/components/layout/Header.tsx` — логотип SVG + навигация + CTA
- `src/components/layout/NavLanternItem.tsx` — пункт меню с фонарём
- `src/components/layout/Footer.tsx` — контакты, навигация, соцсети

**Ключевые детали — NavLanternItem:**
```tsx
// 'use client'
const { contextSafe } = useGSAP({ scope: containerRef })

// конус: radial-gradient(ellipse at top center, accent-cold → transparent)
// position: absolute; top: 100%; width: 120%; height: 60px
// scaleY: 0 изначально; transformOrigin: 'top center'

const handleEnter = contextSafe(() => {
  gsap.to(coneRef.current, { scaleY: 1, opacity: 1, duration: 0.3, ease: 'power2.out' })
  gsap.to(textRef.current, { textShadow: '0 0 14px rgba(170,210,255,0.65)', duration: 0.3 })
})
const handleLeave = contextSafe(() => {
  gsap.to(coneRef.current, { scaleY: 0, opacity: 0, duration: 0.25 })
  gsap.to(textRef.current, { textShadow: 'none', duration: 0.25 })
})
```

Активный пункт: `const isActive = usePathname() === item.href` → если true, конус `scaleY: 1` изначально без hover

**⚠️ Нюансы:**
- `contextSafe` обязателен для hover-хендлеров вне useGSAP scope
- Header: `position: sticky; top: 0; z-index: 50` + `backdrop-filter: blur(12px)` + полупрозрачный bg
- Для `/#about` якоря на главной: `isActive` = `pathname === '/'`
- Footer имеет ссылки на соцсети (href="#"), иконки lucide-react: Twitter, Telegram, ExternalLink

**Критерии проверки:**
- Конус появляется под пунктом меню при hover
- Текущая страница — постоянный фонарь
- Header sticky работает при скролле

---

### Шаг 6: UI-компоненты (переиспользуемые)

**Что делаем:**
- `src/components/ui/RevealOnScroll.tsx`
- `src/components/ui/SectionHeading.tsx`
- `src/components/ui/StatCounter.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/AmbientVideoBackground.tsx`

**Ключевые детали:**

RevealOnScroll — ScrollTrigger + opacity + translateY + blur:
```tsx
useGSAP(() => {
  gsap.from(ref.current, {
    opacity: 0, y: 40, filter: 'blur(8px)',
    duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true }
  })
}, { scope: ref, dependencies: [] })
```

SectionHeading — SplitText mask:lines:
```tsx
useGSAP(() => {
  const split = new SplitText(titleRef.current, { type: 'lines', mask: 'lines' })
  gsap.from(split.lines, {
    y: '100%', duration: 0.9, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: titleRef.current, start: 'top 80%', once: true }
  })
  return () => split.revert()
}, { scope: titleRef, dependencies: [] })
```

AmbientVideoBackground:
```tsx
<video
  src={src} autoPlay muted loop playsInline preload="none"
  className="fixed inset-0 w-full h-full object-cover -z-10"
  style={{ opacity: 0.12 }}
/>
```

**⚠️ Нюансы:**
- `split.revert()` в cleanup — обязательно для SplitText
- `filter: blur()` в GSAP — `will-change: transform, filter` (не только transform!) на [data-reveal] в globals.css
- StatCounter: `easeOutCubic` + `requestAnimationFrame` + `IntersectionObserver`; останавливать `cancelAnimationFrame` при размонтировании; `deps: []` а не `deps: [item.value]` — иначе observer пересоздаётся, но `startedRef` не сбрасывается
- `once: true` в ScrollTrigger — анимация не повторяется
- Проблема: `scope: titleRef` в SectionHeading при анимации subtitleRef → subtitleRef вне scope, ScrollTrigger не убивается. Решение: общий `containerRef` как wrapper div, `scope: containerRef`
- Проблема: AmbientVideoBackground без `'use client'` → hydration mismatch с autoPlay. Решение: добавить `'use client'`; монтировать только один раз на страницу (не в layout)
- Проблема: `<a href>` в Card → теряется SPA-навигация. Решение: `Link` из `next/link`
- `key={item.label}` в StatCounter — не `key={i}`, иначе React не сможет reconcile при переупорядочивании

**✅ ВЫПОЛНЕНО — результаты:**
- RevealOnScroll: ScrollTrigger + opacity/translateY/blur, `delay` в deps
- SectionHeading: SplitText lines mask, containerRef как scope, guard для null ref, split.revert() в cleanup
- StatCounter: AnimatedStat с IntersectionObserver + requestAnimationFrame + cancelAnimationFrame
- Card: `Link` из next/link для href, button для onClick
- AmbientVideoBackground: `'use client'`, fixed inset-0, opacity проп
- globals.css: `will-change: transform, filter` для [data-reveal]
- `tsc --noEmit` → 0 ошибок

**Критерии проверки:**
- ✅ Блоки появляются при скролле с blur-эффектом
- ✅ SplitText: строки выезжают снизу вверх
- ✅ StatCounter: цифры анимируются при входе в viewport

---

### Шаг 7: Главная страница (Hero + О нас)

**Что делаем:**
- `src/app/page.tsx`
- Hero — split layout (видео 40% + текст 60%)
- GSAP timeline: название → уезжает вверх + fade → появляется фраза + StatCounter
- Секция #about — инфографика достижений + фон fon1.jpg

**Ключевые детали — Hero layout:**
```tsx
<section className="h-screen flex items-center overflow-hidden">
  {/* Видео-панель */}
  <div className="w-2/5 h-full relative flex items-center justify-center overflow-hidden">
    <video src="/video/dama.mp4" autoPlay muted loop playsInline
           className="h-full w-auto max-w-none" style={{ objectFit: 'contain' }} />
  </div>
  {/* Текст-панель */}
  <div className="w-3/5 flex flex-col justify-center px-16 gap-8">
    <h1 ref={titleRef} className="font-heading text-6xl">ШУМСКАЯ И ПАРТНЁРЫ</h1>
    <p ref={phraseRef} style={{ opacity: 0 }}>Броская фраза о компании</p>
    <div ref={statsRef} style={{ opacity: 0 }}><StatCounter items={STATS} /></div>
    <button ref={ctaRef} style={{ opacity: 0 }} onClick={() => lenis?.scrollTo('#about')}>
      Узнать больше
    </button>
  </div>
</section>
```

GSAP timeline (запускается через 1 секунду после mount):
```tsx
const tl = gsap.timeline({ delay: 1 })
tl.to(titleRef.current, { y: -80, opacity: 0, duration: 0.9, ease: 'power2.in' })
  .to([phraseRef.current, statsRef.current, ctaRef.current],
     { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out' }, '-=0.2')
```

**⚠️ Нюансы:**
- Видео `dama.MP4` вертикальное — `h-full w-auto object-contain` сохраняет пропорции без кропа
- `useLenis()` из `lenis/react` — для `lenis.scrollTo('#about')`
- Если SplitText применён к h1 — timeline должен анимировать либо целый элемент, либо `split.words`
- Видео: `preload="metadata"` — загружает только метаданные, не весь файл

**⚠️ Нюансы:**
- Проблема: `gsap.from()` в RevealOnScroll вызывает FOUC — браузер сначала рендерит финальное состояние, потом JS устанавливает from-state → Решение: заменить на `gsap.set() + gsap.to()`, `set` работает синхронно до первого рендера
- Проблема: `RevealOnScroll` вокруг `StatCounter` → двойное срабатывание (ScrollTrigger + IntersectionObserver внутри StatCounter) → Решение: StatCounter самодостаточен через IntersectionObserver, не оборачивать его в RevealOnScroll
- Проблема: inline `style={{ transform: 'translateY(20px)' }}` + `gsap.to({ y: 0 })` → нестабильно при медленном JS → Решение: `gsap.set([el1, el2], { opacity: 0, y: 20 })` внутри `useGSAP` вместо inline styles
- StatCounter стоит в секции #about (не в Hero) — критерий "анимируется при скролле к #about" реализован через IntersectionObserver внутри StatCounter, а не через RevealOnScroll
- `<button>` без `type="button"` → браузер может трактовать как submit → всегда добавлять `type="button"` для не-form кнопок

**✅ ВЫПОЛНЕНО — результаты:**
- Hero: split layout 40%/60%, видео dama.mp4 в пропорциях (h-full w-auto object-contain)
- GSAP timeline (delay 1s): h1 уходит вверх (-80px, opacity 0), затем фраза + CTA появляются (stagger 0.15)
- Секция #about: фон fon1.jpg (opacity 0.15), SectionHeading (SplitText lines), StatCounter с IntersectionObserver
- `tsc --noEmit` → 0 ошибок; `npm run build` → success

**Критерии проверки:**
- Видео воспроизводится в правильных пропорциях без кропа
- Анимация: название уходит вверх → появляется фраза + CTA
- StatCounter анимируется при скролле к #about

---

### Шаг 8: Страница Команда (/team)

**Что делаем:**
- `src/app/team/page.tsx`
- 3–5 карточек с silhouette + имя + должность
- Hover: gold-border glow
- AmbientVideoBackground: infograf1.MP4

**Ключевые детали:**
```tsx
// Silhouette: SVG-иконка человека или CSS-фигура на dark gradient background
<div className="card group border border-[var(--color-card-border)]/40 transition-all duration-300
                hover:border-[var(--color-card-border)] hover:shadow-[0_0_24px_var(--color-card-border)]">
  <div className="w-full aspect-[3/4] bg-gradient-to-b from-zinc-700 to-zinc-900 
                  flex items-end justify-center pb-8">
    {/* SVG силуэт человека */}
  </div>
  <div className="p-6">
    <h3>Анна Шумская</h3>
    <p>Управляющий партнёр</p>
  </div>
</div>
```

---

### Шаг 9: Страница Практики (/practice)

**Что делаем:**
- `src/app/practice/page.tsx`
- 4–6 карточек практик
- Hover: подсветка + мини-лист 2–3 продуктов справа
- AmbientVideoBackground: infograf1.MP4, фоны fon2.jpg

**Ключевые детали — hover products panel:**
```tsx
<div className="relative group">
  <PracticeCard title={practice.title} />
  {/* Продукты справа — появляются при hover */}
  <div className="absolute left-full top-0 w-56 pl-4 
                  opacity-0 translate-x-2 pointer-events-none
                  group-hover:opacity-100 group-hover:translate-x-0
                  transition-all duration-300 z-10">
    <ul className="border border-[var(--color-card-border)]/40 bg-[var(--color-bg)] p-4 space-y-2">
      {practice.products.map(p => <li key={p}>{p}</li>)}
    </ul>
  </div>
</div>
```

**⚠️ Нюансы:**
- Последняя карточка в ряду — панель может выйти за правый край. Решение: `right-full` вместо `left-full` для крайних карточек (по `i % 2 === 1` в grid-cols-2).
- Проблема: `pl-4`/`pr-4` на hover-панели — это padding **внутрь** панели, не внешний зазор. → Решение: `ml-2`/`mr-2` для зазора между панелью и карточкой.
- SectionHeading рендерит `<h2>` → заголовки карточек в цикле должны быть `<h3>`, иначе нарушение структуры заголовков.
- `overflow-hidden` на `<main>` обязателен — иначе hover-панели создают горизонтальный скролл.

**✅ ВЫПОЛНЕНО:**

---

### Шаг 10: Страница Кейсы (/cases)

**Что делаем:**
- `src/app/cases/page.tsx`
- 4 карточки: заголовок + описание + сумма + год
- Циановый акцент (`--color-accent-cold`) на цифрах и hover-состояниях
- AmbientVideoBackground: infograf2.MP4

**Ключевые детали:**
```ts
// constants/content/cases.ts
export const CASES = [
  { title: 'Защита девелопера', desc: 'Банкротные споры', amount: '5,4 млрд ₽', year: '2024' },
  { title: 'Международный арбитраж', desc: 'Корпоративный спор', amount: '18 млн €', year: '2023' },
  { title: 'Защита IT-компании', desc: 'Субсидиарная ответственность', amount: '1,2 млрд ₽', year: '2023' },
  { title: 'Налоговый спор', desc: 'Оспаривание доначислений', amount: '780 млн ₽', year: '2024' },
]
```

---

### Шаг 11: Страница Медиа (/media)

**Что делаем:**
- `src/app/media/page.tsx`
- 4–6 карточек: gradient-placeholder превью + название издания + заголовок + дата + ссылка (href="#")
- AmbientVideoBackground: infograf3.MP4

**Ключевые детали:**
```ts
export const MEDIA = [
  { publisher: 'ПроБанкротство', title: 'Тренды банкротного права 2025', date: '15 апр 2025' },
  { publisher: 'Коммерсантъ', title: 'Субсидиарная ответственность: защита директора', date: '3 фев 2025' },
  { publisher: 'Право.ru', title: 'Банкротство застройщиков: итоги года', date: '20 янв 2025' },
  { publisher: 'Forbes', title: 'Лучшие юристы по банкротству', date: '5 дек 2024' },
]
```

Превью: `bg-gradient-to-br from-zinc-700 to-zinc-900 aspect-video`

---

### Шаг 12: Страница Польза (/benefit)

**Что делаем:**
- `src/app/benefit/page.tsx`
- 3 карточки: название + описание + иконка + кнопка «Скачать» (e.preventDefault())
- AmbientVideoBackground: infograf4.MP4

**Ключевые детали:**
```ts
export const BENEFITS = [
  { title: 'Чек-лист по банкротству', desc: 'Пошаговое руководство для кредиторов и должников', icon: 'FileCheck' },
  { title: 'Гайд по субсидиарке', desc: 'Как директору защититься от субсидиарной ответственности', icon: 'ShieldCheck' },
  { title: 'Шаблон претензии', desc: 'Готовый документ для досудебного урегулирования', icon: 'FileText' },
]
```

---

### Шаг 13: Страница Контакты (/contacts)

**Что делаем:**
- `src/app/contacts/page.tsx`
- Форма: имя, телефон (маска), сообщение, выбор практики (select)
- `useState(submitted)` → при submit показывает «Спасибо, свяжемся с вами»
- Реквизиты: телефон, email, адрес (всё заглушки)
- Фон fon3.jpg

**Ключевые детали — маска телефона:**
```ts
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (!d) return '+7'
  const n = d.startsWith('7') ? d : '7' + d
  let r = '+7'
  if (n.length > 1) r += ' (' + n.slice(1, 4)
  if (n.length > 4) r += ') ' + n.slice(4, 7)
  if (n.length > 7) r += '-' + n.slice(7, 9)
  if (n.length > 9) r += '-' + n.slice(9, 11)
  return r
}
```

**⚠️ Нюанс:** Select «Выбор практики» должен иметь те же значения что и константы в `PRACTICES` — импортировать из `src/constants/content/practice.ts`.

---

### Шаг 14: Page transitions (Fade)

**Ключевые детали — CSS View Transitions API (надёжнее чем GSAP для App Router):**
```css
/* globals.css */
::view-transition-old(root) {
  animation: fade-out 0.25s ease-in forwards;
}
::view-transition-new(root) {
  animation: fade-in 0.3s ease-out forwards;
}
@keyframes fade-out { to { opacity: 0 } }
@keyframes fade-in { from { opacity: 0 } }
```

```ts
// next.config.ts
const nextConfig = {
  experimental: { viewTransition: true },
}
```

**⚠️ Нюанс:** View Transitions API поддерживается в Chrome 111+, Safari 18+, Firefox 130+. Если нужна поддержка старых браузеров — fallback через `usePathname + gsap.to(opacity: 0/1)` в layout.tsx.

---

### Шаг 15: Logo intro-анимация

**Что делаем:**
- `src/components/ui/LogoIntro.tsx` — только на главной `/`
- Показывается при каждом открытии

**Ключевые детали:**
```tsx
// 'use client'
// overlay: fixed inset-0 z-[100] bg-[#262424]
// Logo SVG центровано, начальный размер ~min(vw,vh)/1.5

useEffect(() => {
  const logoEl = containerRef.current
  const target = document.querySelector('[data-header-logo]')
  const rect = target?.getBoundingClientRect()
  
  const tl = gsap.timeline({ onComplete: () => setVisible(false) })
  tl.to(logoEl, { opacity: 1, duration: 0.8, ease: 'power2.out' })
    .to(logoEl, {
      top: rect?.top ?? 0, left: rect?.left ?? 0,
      width: 36, height: 36,
      duration: 1.7, ease: 'power3.inOut'
    })
    .to(overlayRef.current, { opacity: 0, duration: 0.4 })
}, [])
```

**⚠️ Нюансы:**
- SVG логотип обязателен — PNG/JPG артефачит при масштабировании
- `style={{ opacity: 0 }}` на первом рендере — нет flash до запуска анимации
- `onClick` на overlay → `tl.progress(1)` (мгновенный пропуск)
- Intro подключается в `src/app/page.tsx`, НЕ в root layout — иначе играет на всех страницах

---

### Шаг 16: Проверка и полировка

**Чеклист проверки:**
- [ ] `npm run build` — 0 ошибок TypeScript, 0 warning'ов шрифтов
- [ ] `npm run dev` → открыть в браузере 1440px
- [ ] Hero: видео не кропится, текст уходит вверх → появляется фраза + цифры
- [ ] StatCounter: цифры анимируются при скролле к #about
- [ ] SectionHeading: строки выезжают снизу на всех страницах
- [ ] RevealOnScroll: blur-эффект появления
- [ ] Фонарь: конус под пунктом меню при hover + постоянный для активного
- [ ] Logo intro: играет при каждом открытии `/`, пропускается кликом
- [ ] Page transition: fade при переходе между страницами
- [ ] Ambient video: фон виден (opacity ~0.12) на всех внутренних страницах
- [ ] Практики: hover → мини-лист продуктов справа
- [ ] Форма контактов: показывает «Спасибо» после submit
- [ ] Footer: соцсети, навигация, реквизиты-заглушки

---

## Критические файлы для создания

```
src/lib/gsap.ts
src/components/layout/SmoothScrollProvider.tsx
src/components/layout/Header.tsx
src/components/layout/NavLanternItem.tsx
src/components/layout/Footer.tsx
src/components/ui/RevealOnScroll.tsx
src/components/ui/SectionHeading.tsx
src/components/ui/StatCounter.tsx
src/components/ui/Card.tsx
src/components/ui/AmbientVideoBackground.tsx
src/components/ui/LogoIntro.tsx
src/app/page.tsx                  ← главная + О нас
src/app/team/page.tsx
src/app/practice/page.tsx
src/app/cases/page.tsx
src/app/media/page.tsx
src/app/benefit/page.tsx
src/app/contacts/page.tsx
src/constants/content/{home,team,practice,cases,media,benefit,contacts}.ts
src/constants/nav.ts
src/types/content.ts
```

---

## Порядок выполнения (от простого к сложному)

1. Шаг 0 → подготовка медиа и ресурсов
2. Шаг 1 → инициализация проекта
3. Шаг 2 → CSS + шрифты
4. Шаг 3 → GSAP + Lenis
5. Шаг 4 → типы и константы
6. Шаг 5 → Header + Footer (без анимаций, только вёрстка)
7. Шаг 6 → UI-компоненты
8. Шаги 8–13 → все внутренние страницы (контент без анимаций)
9. Шаг 7 → Hero-анимация (сложная)
10. Шаг 5 (анимации) → NavLanternItem hover-эффект
11. Шаг 14 → Page transitions
12. Шаг 15 → Logo intro (самое сложное)
13. Шаг 16 → Полировка и проверка
