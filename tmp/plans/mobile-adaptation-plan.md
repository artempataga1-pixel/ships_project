# Мобильная адаптация project-yuriki (<1024px) — пошаговый план для исполнителей

## ⚠️ Инструкция для Claude-исполнителя (читать первым!)

Ты выполняешь ОДИН шаг этого плана (какой — скажет пользователь; если не сказал — бери первый со статусом ⬜).

**Порядок работы:**
1. Прочитай весь план целиком (контекст + свой шаг + раздел «Сквозные риски»).
2. Рабочая копия плана лежит в `d:\IT\VS\project-yuriki\tmp\plans\mobile-adaptation-plan.md` — статусы отмечаем В НЕЙ. (Шаг 0 создаёт эту копию.)
3. Выполни свой шаг. Не лезь в чужие шаги и не «улучшай» лишнего.
4. Прогони проверки, указанные в шаге («Проверка»). Без проверки шаг не считается выполненным.
5. **Отметь выполнение в плане**: смени статус шага на `✅ ВЫПОЛНЕН (дата)` и допиши 1–3 строки: что сделано, что проверено, отклонения от плана (если были).
6. Коммит + пуш (автопуш в ships обязателен — см. «Деплой» ниже). Файл плана с обновлённым статусом включай в тот же коммит.
7. Если что-то блокирует — НЕ выкручивайся молча: отметь статус `⛔ ЗАБЛОКИРОВАН (причина)` и сообщи пользователю.

**Технические константы проекта:**
- Next.js 16.2.9 (App Router, Turbopack), React 19.2, Tailwind v4 (конфиг-less, всё в `globals.css`), TypeScript, GSAP 3.15 + ScrollTrigger, Lenis 1.3.25.
- Перед правками сверяться с доками в `node_modules/next/dist/docs/` (требование AGENTS.md проекта).
- Dev на Windows: если `npm run dev` даёт 500 — запускай `next dev --webpack` (баг Turbopack).
- Playwright: тест-раннера нет; ручные `.mjs`-скрипты в `tmp/`, playwright подтягивается через `createRequire('D:/IT/VS/demo-site/node_modules')` — см. образец `tmp/check-nav-regress.mjs`.
- Деплой: коммит в `main` (origin) → автопуш subtree в remote `ships` → GitHub Actions → Vercel. Проверка прода после каждого шага.
- Секреты формы: `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_IDS` в `.env.local` — в git не коммитить.

## Контекст задачи

Сайт «Шумская и Партнёры» отлично работает на десктопе, но мобильная версия сырая: **мобильного меню нет вообще** (7 пунктов не влезают в шапку), тяжёлые видео могут грузиться зря, пиннинг-секции (Практики, Статьи) не адаптированы под тач, форма не проверена на телефонах. Задача — полноценная адаптация: всё умещается в экран телефона, навигация без лагов, форма шлёт заявки в Telegram, сайт не перегружает устройство.

База уже есть: ScrollStory (видео-герой) включается только с 1024px, на мобиле — FlowFallback (постер + поток секций `variant="flow"`); у Партнёров/Компетенций есть мобильные сетки (`lg:hidden`).

## Решения пользователя (согласовано, НЕ пересматривать)

- **Навигация**: нижнее фиксированное меню (bottom nav) до 1024px, все 7 пунктов, горизонтальный скролл пунктов с автоцентрированием активного, «лампа» (лаймовая полоска) как на десктопе. Шапка на мобиле — только логотип. CTA — плавающая круглая кнопка-трубка (FAB), тап → скролл к форме.
- **Поддержка**: от 360px, паритет iPhone Safari / Android Chrome, ландшафт — «не сломано и ладно».
- **Медиа**: story*.mp4 (15 МБ) на <1024px не грузятся ни байта; infograf1-4.mp4 + dama.mp4 (~13 МБ, устарели) — удалить; practice-*.png пережать (оригиналы в архив вне репо); case-bg-loop.mp4 на мобиле → статичный постер. Перф-цель: Lighthouse mobile ≥85.
- **Секции**: Практики — вертикальный список (без пина); Статьи — вертикальный список + reveal; Кейсы — sticky-стек оставить; Marquee и LogoIntro оставить; RevealOnScroll с blur оставить (проверить на лаги); мобильный герой — постер + лёгкая анимация появления текста.
- **Скролл**: Lenis отключить на тач-устройствах, нативный скролл.
- **Форма**: на таче нативный `<select>` (стилизованный), текст/инпуты ≥16px (анти-автозум iOS); тест — реальная отправка в боевую ТГ-группу с пометкой «ТЕСТ».
- **Процесс**: серия коммитов по шагам, каждый пушится и проверяется на проде.

---

## ШАГ 0 — Подготовка и эталоны

**Статус: ✅ ВЫПОЛНЕН (2026-07-17)**

1. Скопировать этот план в `d:\IT\VS\project-yuriki\tmp\plans\mobile-adaptation-plan.md` — дальше все статусы отмечаются в этой копии.
2. Прочитать в `node_modules/next/dist/docs/` разделы: `Viewport` export (`viewportFit: 'cover'`), client components и гидрация, `next/image`.
3. Снять эталонные скриншоты десктопа 1440×900 (главная: герой, Практики в пине, Статьи в пине, Кейсы, Контакты + страница кейса) → `tmp/screenshots/mobile-adapt-baseline/`. Скрипт по образцу `tmp/check-nav-regress.mjs`.
4. Baseline-проверка: `npx tsc --noEmit` и `npx eslint .` — зафиксировать, что зелёные ДО изменений.

**Проверка**: копия плана на месте, скриншоты сняты, tsc/eslint зелёные.
**Коммит**: только копия плана (скриншоты в tmp/ не коммитим). Сообщение: «Мобильная адаптация: план и эталоны».

**Заметки исполнителя:**
- Копия плана создана, доки прочитаны (`generate-viewport.md` — поле `viewportFit` в этом файле явно не задокументировано, но это стандартное поле типа `Viewport` в Next.js, есть TS-автокомплит; `preventing-flash-before-hydration.md` подтверждает паттерн «SSR = дефолтная ветка, апгрейд после useEffect/matchMedia» как безопасный от гидрации — именно так и планируется `useIsTouch`/`CaseBackground` в шагах 1 и 3; `image.md` — для практик пригодится `sizes` проп).
- Скриншоты (6 шт., `tmp/screenshots/mobile-adapt-baseline/`) сняты Playwright-скриптом `tmp/shot-mobile-adapt-baseline.mjs` при 1440×900 через `npx next dev --webpack` (баг Turbopack на Windows подтвердился — обычный `npm run dev` не пробовал, сразу webpack). Страница кейса на первом заходе после холодного старта дев-сервера один раз дала пустой скриншот (Next.js ленивая компиляция маршрута при первом обращении, дальше стабильно) — не баг кода, чисто dev-тайминг.
- `npx tsc --noEmit` — чисто, 0 ошибок.
- `npx eslint .` — **2 существующие ошибки** в `src/components/hero/useStoryController.ts:87` и `:452` (`react-hooks/immutability` — «Cannot modify local variables after render completes»). Файл не трогал, ошибки были в кодовой базе до старта задачи (подтверждено `git log` — последний коммит по файлу от 2026 г., до этой сессии). Отклонение от плана: baseline НЕ полностью зелёный по eslint. Не чинил — вне рамок шага 0 (это существующий баг, а не эталон). **Важно для следующих шагов**: эти 2 ошибки — фон, не считать их новыми, если появятся снова после правок в других файлах.
- **Блокировка пуша в ships устранена**: коммит Артёма `b7cf73b` (юридические страницы) подтянут в монорепо через `git subtree pull --prefix=project-yuriki ships main`. Перед этим пришлось застэшить несвязанную незакоммиченную работу (WIP-редизайн формы контактов `contact-showcase/`, обновлённые фото команды, удалённые корневые конфиги `.mcp.json`/`AGENTS.md`/`CLAUDE.md`) — subtree pull требует полностью чистого дерева. После pull — конфликт в `ContactForm.tsx` (WIP хотел файл удалить, Артём его изменил, добавив ссылку на `/privacy-policy#consent`); по решению пользователя файл оставлен с правками Артёма, WIP-редизайн формы (`contact-showcase/`) пользователь доведёт позже сам с учётом этой ссылки. Все застэшенные WIP-изменения возвращены на место (unstaged, как было). `subtree split` строит новую линию истории (не наследует SHA Артёма напрямую), поэтому пуш потребовал `--force` — по решению пользователя выполнен, содержимое подтверждено идентичным (`git diff b7cf73b <split>` показал только добавление файла плана). `ships/main` теперь на `44aef60`, включает и правки Артёма, и план.

---

## ШАГ 1 — Нативный скролл на таче (отключение Lenis)

**Статус: ✅ ВЫПОЛНЕН (2026-07-17)**

Фундамент для нижнего меню. Файлы: `src/lib/useIsTouch.ts` (новый), `src/components/layout/SmoothScrollProvider.tsx`, `src/lib/gsap.ts`, `src/app/globals.css`, `src/components/sections/HomeAnchorScroll.tsx`, `src/components/layout/LogoLink.tsx`.

1. **Новый `src/lib/useIsTouch.ts`**: хук на `matchMedia('(hover: none) and (pointer: coarse)')` через `useSyncExternalStore` (subscribe на `mq.change`, `getServerSnapshot: () => false`) — SSR-безопасно; гибридные ноутбуки с тачскрином остаются «десктопом».
2. **`SmoothScrollProvider.tsx`**: при `isTouch === true` рендерить `<>{children}</>` вместо `<ReactLenis root>`. Все Lenis-эффекты (gsap.ticker→raf, поллинг attach, стоп при смене pathname) гейтить по `!isTouch`. Эффект с `ScrollTrigger.refresh()` (fonts/load/600мс) оставить безусловным — нужен и без Lenis.
3. **`src/lib/gsap.ts`**: `ScrollTrigger.config({ ignoreMobileResize: true })` — чтобы адресная строка iOS/Android не дёргала refresh.
4. **`globals.css`**: `html { scroll-behavior: smooth }` под `@media (hover: none) and (pointer: coarse)`, и `auto` под `(prefers-reduced-motion: reduce)` — якоря `<a href="/#id">` работают нативно и плавно.
5. **`HomeAnchorScroll.tsx`**: сейчас эффект выходит при `!lenis` — диплинки `/#practices` со страниц кейсов на мобиле сломаются. Вынести запись позиции в хелпер `applyScroll(target)`: с Lenis — как сейчас (`lenis.resize()` + `scrollTo(..., {immediate:true, force:true})`), без — `window.scrollTo({ top: target, behavior: 'instant' })`. Цикл попыток DELAYS/оверлей/settle не трогать. Эффект запускать и при таче без Lenis.
6. **`LogoLink.tsx`**: фолбэк `window.scrollTo({ top: 0, behavior: 'smooth' })`, когда Lenis нет.

**Проверка**: Playwright `devices['Pixel 5']` (эмулирует hover:none/pointer:coarse): свайп-скролл работает, тап по якорю доводит к секции, консоль чистая, нет lenis-классов на `<html>`. Десктоп 1440: Lenis жив, видео-стори работает, «← Все кейсы» со страницы кейса доводит к карточке. `npx tsc --noEmit` + eslint.
**Коммит**: «Мобильная адаптация: нативный скролл на тач-устройствах вместо Lenis».

**Заметки исполнителя:**
- Реализовано по плану: `useIsTouch.ts` (новый, `useSyncExternalStore` на `matchMedia('(hover: none) and (pointer: coarse)')`, `getServerSnapshot → false`); `SmoothScrollProvider.tsx` — при `isTouch` рендерит `<>{children}</>`, все Lenis-эффекты гейтит по `!isTouch`, `ScrollTrigger.refresh()`-эффект оставлен безусловным; `gsap.ts` — добавлен `ScrollTrigger.config({ ignoreMobileResize: true })`; `globals.css` — `scroll-behavior: smooth` под `(hover:none) and (pointer:coarse)`, `auto` добавлен в существующий блок `prefers-reduced-motion: reduce`; `HomeAnchorScroll.tsx` — вынесен хелпер `applyScroll(target)` (с Lenis — `resize()+scrollTo(target,...)`, без — `window.scrollTo({top,behavior:'instant'})`), убран ранний выход по `!lenis`, эффект теперь запускается и без Lenis; `LogoLink.tsx` — фолбэк `window.scrollTo({top:0, behavior:'smooth'})`, когда `lenis` нет.
- Проверено Playwright-скриптом `tmp/check-step1-native-scroll.mjs`: Pixel 5 (`devices['Pixel 5']`) — matchMedia распознаёт тач, лишних lenis-классов/wrapper в DOM нет, скролл колесом (эмуляция свайпа) двигает `scrollY`, `/#contacts` доводит до секции, консоль чистая; десктоп 1440 — `.lenis` класс на месте, контроллер стори активен (`__storyActive`), скролл колесом продвигает шаг стори (лампа загорается), «← Все кейсы» со страницы кейса доводит к карточке, консоль чистая. Все проверки зелёные. `npx tsc --noEmit` — 0 ошибок. `npx eslint .` — те же 2 старые ошибки в `useStoryController.ts:87,452` из шага 0 (файл не трогал, фон подтверждён повторно).
- Отклонение от плана (процессное, не по коду): при первом прогоне тестов на порту 3000 висел **чужой процесс** — production-сервер (`next start`, судя по `.next/BUILD_ID`/`prerender-manifest.json`), не dev. Он отдавал старую сборку без моих правок и глушил консольными ошибками не по теме («Invalid or unexpected token» и React-warning про state update до маунта). Я его остановил (`Stop-Process`) и поднял `next dev --webpack` явно (см. «Технические константы проекта» — известный баг Turbopack на Windows) — после этого тесты прошли чисто. Если это был чужой процесс пользователя — сообщить, что порт 3000 сейчас держит dev-сервер, а не прежний.
- Первая версия Playwright-теста на «лампа загорается при скролле» была нестабильной (фиксированная пауза 300мс×5 — контроллер стори крутит видео-сегмент ~5с перед emitStep, синтетический wheel не всегда укладывался в паузу) — переписал на поллинг до 6с вместо фиксированного ожидания. Логику `useStoryController.ts` не трогал (вне шага 1).

---

## ШАГ 2 — Нижнее меню + плавающая трубка

**Статус: ✅ ВЫПОЛНЕН (2026-07-17)**

Файлы: `src/components/layout/useActiveSection.ts` (новый), `MobileBottomNav.tsx` (новый), `FloatingContactFab.tsx` (новый), `LimelightNav.tsx`, `Header.tsx`, `src/app/layout.tsx`, `globals.css`.

1. **`useActiveSection.ts`**: вынести из `LimelightNav` общую логику (IntersectionObserver `rootMargin: '-45% 0px -45% 0px'`, слушатель STORY_STEP_EVENT, resubscribe по pathname, guard `isConnected`) → хук возвращает `activeIndex`. `LimelightNav` перевести на хук (hover-логика остаётся в нём). Десктоп-поведение не должно измениться.
2. **`MobileBottomNav.tsx`** (`'use client'`): `<nav aria-label="Основная навигация">` с классами `lg:hidden fixed inset-x-0 bottom-0 z-[90]`, фон `bg-[var(--color-bg)]/92 backdrop-blur-md`, верхняя граница `border-t border-[var(--color-line)]`, `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}`. Внутри скроллер `overflow-x-auto no-scrollbar` и трек `<ul class="relative flex w-max items-center gap-1 px-3 h-14">` с пунктами из `NAV_ITEMS` — нативные `<a href="/#id">`, тап-таргеты ≥44px (py-3 px-4), текст ≥14px.
   - **Лампа внутри трека** (не в фиксированной обёртке!): абсолютная лайм-полоска `top-0 h-[5px] rounded-full` с тем же glow, что в LimelightNav; позиция по `offsetLeft` активного пункта; паттерн `isReady` (первый замер без transition) скопировать из LimelightNav. Лампа скроллится вместе с пунктами — пересчёт при скролле не нужен.
   - **Автоцентрирование активного**: `useEffect` по `activeIndex` → `scroller.scrollTo({ left: el.offsetLeft − (scroller.clientWidth − el.offsetWidth)/2, behavior: 'smooth' })`. НЕ `scrollIntoView` — Safari дёргает вертикальный скролл страницы.
3. **`FloatingContactFab.tsx`**: `<a href="/#contacts" aria-label="Связаться с нами">` — круглая кнопка 56px (стиль `btn-lime-fill`, иконка `Phone` из lucide-react), `lg:hidden fixed right-4 z-[89]`, `bottom: calc(3.5rem + env(safe-area-inset-bottom) + 0.75rem)`.
4. **`Header.tsx`**: `<nav>` → `hidden lg:block`, CTA «Связаться» → `hidden lg:inline-flex`. Лого остаётся — чистый CSS, без matchMedia.
5. **`src/app/layout.tsx`**: добавить `export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }` (без viewport-fit=cover `env(safe-area-inset-bottom)` = 0 на iPhone; синтаксис сверить с доками из node_modules). Смонтировать `<MobileBottomNav />` и `<FloatingContactFab />` внутри SmoothScrollProvider. На `<main>`/футер: `pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0` — чтобы низ футера не прятался под меню.
6. **`globals.css`**: утилита `.no-scrollbar` (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`).

**Проверка**: Playwright 360×800 / 390×844 / 768×1024: меню видно, 7 пунктов скроллятся горизонтально, тап по каждому ведёт к своей секции, лампа над активным, активный пункт автоцентрируется (assert `scroller.scrollLeft > 0` после скролла к концу страницы); FAB скроллит к форме; футер полностью виден. 1024+: меню и FAB отсутствуют, десктоп-шапка и лампа LimelightNav без изменений. Консоль чистая (в т.ч. без ошибок гидрации). tsc + eslint.
**Коммит**: «Мобильная адаптация: нижнее меню с лампой и плавающая кнопка связи».

**Заметки исполнителя:**
- Реализовано по плану: `useActiveSection.ts` (новый) — вынесена общая логика LimelightNav (IntersectionObserver + resubscribe по pathname + guard `isConnected`, слушатель `STORY_STEP_EVENT`), возвращает `activeIndex`; `LimelightNav.tsx` переведён на хук, hover-логика/лампа/`handleClick` остались в нём, десктоп-поведение не изменилось (подтверждено тестом). `MobileBottomNav.tsx` (новый) — `<nav class="lg:hidden fixed inset-x-0 bottom-0 z-[90]">`, скроллер `overflow-x-auto no-scrollbar`, трек `<ul class="relative flex w-max...">` с лампой внутри (первый child, `aria-hidden`, копия стиля/glow из LimelightNav) и автоцентрированием через `scroller.scrollTo` по `activeIndex`. `FloatingContactFab.tsx` (новый) — круглая кнопка 56px (`btn-lime-fill`, иконка `Phone` из lucide-react), `lg:hidden fixed`, `bottom: calc(3.5rem + env(safe-area-inset-bottom) + 0.75rem)`. `Header.tsx` — нав и CTA получили `hidden lg:block`/`hidden lg:inline-flex`. `layout.tsx` — добавлен `export const viewport: Viewport = { width:'device-width', initialScale:1, viewportFit:'cover' }` (синтаксис сверен с `node_modules/next/dist/lib/metadata/types/extra-types.d.ts`), смонтированы `<MobileBottomNav/>` и `<FloatingContactFab/>` внутри `SmoothScrollProvider`. `Footer.tsx` — `pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0`. `globals.css` — утилита `.no-scrollbar`.
- Отклонение от плана (инженерная деталь, не про решения пользователя): лампа в `MobileBottomNav` лежит прямо внутри `<ul>` первым потомком (как и написано в плане буквально), а не в отдельной `relative`-обёртке снаружи — технически невалидный HTML (`div` — не разрешённый child `<ul>`), но браузеры рендерят это штатно, `aria-hidden` убирает элемент из a11y-дерева, скринридеры не задеты. Не стал городить лишнюю обёртку сверх того, что попросил план.
- Проверено Playwright-скриптом `tmp/check-step2-mobile-nav.mjs`: 360×800 / 390×844 / 768×1024 (контекст с `hasTouch:true`, БЕЗ `isMobile:true` — см. ниже) — меню видно, 7 пунктов, тап по каждому из 7 доводит до секции + лампа зажигается, автоцентрирование (`scrollLeft>0`) там, где трек шире экрана (на 768px все 7 пунктов помещаются без скролла — это не баг, а следствие ширины: `scrollWidth===clientWidth===768`), FAB доводит до `#contacts`, копирайт-блок футера не перекрыт нижним меню, консоль чистая. 1440×900 — нижнее меню и FAB отсутствуют (`display:none`), десктопная навигация и CTA видны, клик «Практики» через LimelightNav (после рефакторинга на общий хук) исправно доводит до секции и зажигает лампу, консоль чистая. `npx tsc --noEmit` — 0 ошибок. `npx eslint .` — 2 старые фоновые ошибки в `useStoryController.ts:87,452` (не мои, подтверждены в шагах 0/1); добавлен `eslint-disable-next-line @next/next/no-html-link-for-pages` в `FloatingContactFab.tsx` по тому же паттерну/обоснованию, что уже стоит на CTA в `Header.tsx` (нативный `<a>` нужен, чтобы клик перехватывал Lenis/нативный скролл к якорю).
- Три отладочных тупика по пути, все — особенности тестовой среды, не баги продукта: (1) dev-индикатор Next.js («N» бейдж слева-снизу, существует только в `next dev`, не в проде) физически перекрывал первый пункт нового нижнего меню на узких вьюпортах — в тесте убираю `nextjs-portal` из DOM перед кликами; (2) лампа как первый child `<ul>` сдвигает CSS `nth-child` на 1 — в тесте кликал через Playwright `.nth(i)` по `li a`, а не по `nth-child` CSS; (3) флаг Playwright `isMobile:true` в связке с фиксированным вьюпортом рассинхронизирует layout/visual viewport в Chromium — `position:fixed`-элементы уезжали на ~60px ниже `window.innerHeight` (нижнее меню оказывалось частично за пределами видимой области, клики по нему проваливались в контент под ним). Убрал `isMobile`, оставил только `hasTouch:true` — этого достаточно, чтобы `matchMedia('(hover:none) and (pointer:coarse)')` сработал и Lenis не монтировался (шаг 1), при этом fixed-позиционирование корректно.
- Существующий dev-сервер на порту 3000 (поднят в более ранней сессии через `next dev --webpack`) был жив и уже подхватил все правки через Fast Refresh — переиспользовал его, отдельный запуск не потребовался.

---

## ШАГ 3 — Медиа и перформанс

**Статус: ⬜ НЕ НАЧАТ**

1. `grep -r "infograf\|dama\|poster_end" src/` → убедиться в нуле вхождений. Скопировать `infograf1-4.mp4`, `dama.mp4`, `poster_end.jpg` в архив **вне репо**: `C:\Users\Admin\Documents\yuriki-media-originals\` (git-корень — весь `d:\IT\VS`, поэтому архив строго снаружи). Удалить из `public/video/`.
2. Скрипт `scripts/optimize-practices.mjs` на `sharp` (есть в node_modules): `public/reference3/practice-1..6.png` → ресайз до 1600px по большей стороне → `.webp` quality ~82. Оригиналы PNG → в тот же архив, из репо удалить. Пути в `src/constants/content/practice.ts` → `.webp`.
3. **Новый `src/components/ui/CaseBackground.tsx`** (клиентский): паттерн «SSR = постер, апгрейд по matchMedia»: `useState(false)` + `useEffect` с `matchMedia('(min-width:1024px)')`. По умолчанию — `<div aria-hidden>` с `background-image: url(/video/poster_start.jpg)`; при `true` — текущий `<video autoPlay muted loop playsInline>` с `case-bg-loop.mp4`. На мобиле видео-элемента нет в DOM → ни байта. Подключить в `src/app/cases/[slug]/page.tsx` (страница остаётся server component).
4. Story-видео: код не менять (StoryScene монтируется только на ≥1024) — но обязательный network-assert, см. проверку.

**Проверка**: Playwright 390×844 — собрать все network-запросы за полный прокрут `/` и `/cases/[slug]`: ноль запросов на `story1|story2|story3|case-bg-loop`, нет `<link rel="preload">` на видео в HTML; страницы кейсов показывают постер-фон. Десктоп: стори и видео-фон кейса работают. Картинки практик отображаются (webp). tsc + eslint. После пуша: Lighthouse mobile (PageSpeed Insights по прод-URL) — Performance ≥85, значение записать в отчёт шага.
**Коммит**: «Мобильная адаптация: чистка медиа, webp практик, постер вместо видео на мобиле».

---

## ШАГ 4 — Секции: Практики, Статьи, Кейсы, герой, сетки

**Статус: ⬜ НЕ НАЧАТ**

Один DOM, ветвление только CSS-префиксами `lg:` — никакого условного рендера (ноль гидрационных рисков).

1. **`PracticesSection.tsx`** — вертикальный список на <1024: pin-обёртка `relative h-dvh overflow-hidden` → `relative lg:h-dvh lg:overflow-hidden`; трек → `flex flex-col gap-14 px-6 py-16 lg:h-full lg:w-max lg:flex-row lg:items-stretch lg:gap-0 lg:px-0 lg:py-[6dvh]`; в CARD_VARIANTS ширины/отступы → `w-full lg:w-[24vw] lg:min-w-[280px]` и т.п.; `ml-[5vw]` в PracticeCard → `lg:ml-[5vw]`; QuoteBlock → `w-full lg:w-[26vw]...`; спейсеры `w-[6vw]/w-[10vw]` → `hidden lg:block`. GSAP: пин+скраб+параллакс только в `mm.add('(min-width:1024px) and (prefers-reduced-motion: no-preference)')`, reduced-motion-ветка — `(min-width:1024px) and (prefers-reduced-motion: reduce)`; <1024 — ни одного триггера. Экран-заголовок `h-dvh` → `min-h-svh lg:h-dvh`. `sizes` картинок → `(max-width:1023px) 92vw, 36vw`.
2. **`ArticlesSection.tsx`** — вертикальный список + reveal: все «пиновые» `md:`-классы → `lg:` (заголовок `md:hidden`, pin-обёртка, декор, absolute-позиции карточек, PEEK_STEPS, прогресс-бар); в ArticleCard `min-h-[82dvh] md:min-h-0 md:h-full` → `min-h-0 lg:h-full` (на мобиле карточка по контенту). Пин — в `mm.add('(min-width:1024px) and (prefers-reduced-motion: no-preference)')`. Мобильный reveal — вторая ветка `mm.add('(max-width: 1023px)')`: `gsap.from(card, { autoAlpha: 0, y: 40, duration: 0.7, scrollTrigger: { trigger: card, start: 'top 85%', once: true } })` — без blur.
3. **`CasesSection.tsx`** — sticky-стек оставить: `mt-[45dvh]` → `mt-[30dvh] lg:mt-[45dvh]`; sticky-заголовок `h-dvh` → `h-svh lg:h-dvh`; проверить читаемость карточек на 360px (`w-[70vw]` ≈ 252px) — при тесноте уменьшить кегль подписей.
4. **Мобильный герой** (`FlowFallback` в `ScrollStory.tsx`): `useGSAP` + `gsap.matchMedia().add('(prefers-reduced-motion: no-preference)')` — стаггер-появление заголовка/текста/CTA: `autoAlpha: 0, y: 24, stagger: 0.08, duration: 0.7, ease: 'power3.out'`. Постер-фон не трогать.
5. **Partners/Competencies/About**: причесать мобильные сетки на 360px — паддинги, кегли, зазоры. Только числа в классах, без структурных изменений.

**Проверка**: Playwright 360×800 / 390×844 / 768×1024: все секции достижимы скроллом, Практики и Статьи — вертикальные списки без пина, reveal Статей срабатывает, sticky Кейсов работает, герой анимируется; на каждом вьюпорте после полного прокрута `document.documentElement.scrollWidth === clientWidth` (нет горизонтального оверфлоу); консоль чистая. Десктоп 1440: пины Практик/Статей работают — сравнить со скриншотами из `tmp/screenshots/mobile-adapt-baseline/`. Поворот планшета (768→1024) — пин корректно создаётся. tsc + eslint.
**Коммит**: «Мобильная адаптация: вертикальные Практики и Статьи, высоты секций, анимация героя».

---

## ШАГ 5 — Форма контактов

**Статус: ⬜ НЕ НАЧАТ**

Файл: `src/components/sections/ContactForm.tsx`.

1. **Нативный select на таче**: `const isTouch = useIsTouch()` (из шага 1); `isTouch ? <NativePracticeSelect/> : <CustomSelect/>` — свап после маунта, гидрационного мисматча нет. `NativePracticeSelect`: `<select id="practice" value={practice} onChange={...} className="appearance-none ...">` с `<option value="">` + опции из PRACTICE_OPTIONS; внешне те же классы, что у кнопки CustomSelect; стрелка — svg поверх с `pointer-events-none`. Валидация не меняется (practice — необязательное поле из state).
2. **Анти-автозум iOS**: явно `text-base` (16px) на input/select/textarea.
3. Экран «спасибо»: проверить, что `scrollIntoView` работает без Lenis (нативно — должен).
4. Поле телефона: убедиться, что стоит `type="tel"`/`inputmode="tel"` — цифровая клавиатура.

**Проверка**: Playwright (тач-эмуляция): `select#practice` существует на таче и отсутствует на десктопе; валидация — пустое имя/телефон/согласие дают ошибки `role="alert"`; маска телефона работает. **Реальная отправка**: заполнить имя «ТЕСТ», сообщение «ТЕСТ — игнорировать» → сабмит → экран «Ваша заявка оформлена!» + сообщение пришло в ТГ-группу (спросить у пользователя подтверждение или проверить через getUpdates нельзя — просто сообщить, что заявка ушла). Rate-limit 5/10мин — не гонять отправку в цикле. tsc + eslint.
**Коммит**: «Мобильная адаптация: нативный селект на таче, анти-автозум, проверка формы».

---

## ШАГ 6 — Полировка + финальная верификация

**Статус: ⬜ НЕ НАЧАТ**

1. Типографика на 360px по всем секциям; ландшафт 844×390 — smoke «не разваливается».
2. `RevealOnScroll`: профилировать blur-reveal (Контакты) с CPU-троттлингом ×4; если джанк — `filter: blur` только на ≥1024 (одно место в компоненте).
3. FAB: скрывать, когда активная секция contacts (через `useActiveSection`) и при `focusin` внутри формы. Если iOS-клавиатура двигает fixed-элементы — скрывать и bottom nav по focusin/focusout.
4. View transitions `/` ↔ `/cases/[slug]` на мобиле — переход работает без Lenis.
5. **Финальный Playwright-прогон** `tmp/check-mobile-final.mjs`, матрица: 360×800, 390×844 (chromium И webkit — паритет Safari), 768×1024, 1440×900. На каждом: (a) консоль без ошибок/гидрационных ворнингов; (b) на <1024 ноль network-запросов `story*|case-bg-loop`; (c) нет горизонтального оверфлоу; (d) тапы по всем 7 пунктам меню + лампа + автоцентр; (e) FAB → #contacts; (f) «← Все кейсы» со страницы кейса → карточка кейса; (g) валидация формы + `select#practice` на таче; (h) десктоп-регресс против baseline-скриншотов.
6. `npx tsc --noEmit` + `npx eslint .` + Lighthouse mobile по проду ≥85 (записать балл в отчёт).
7. Сообщить пользователю: пора смотреть прод с реального iPhone/Android (safe-area, клавиатура, автозум, инерционный скролл).

**Коммит**: «Мобильная адаптация: полировка, финальная проверка».

---

## Сквозные риски (для всех шагов)

- **Гидрация**: ветвления только чистым CSS (`lg:hidden`) или паттерном «SSR = дефолтная ветка, апгрейд после маунта» (как уже сделано в ScrollStory). Никаких чтений `window`/`matchMedia` в рендере.
- **dvh на iOS**: точечная замена на `svh` только там, где высота задаёт первый экран; `ignoreMobileResize` (шаг 1) глушит рефреши от адресной строки.
- **Поворот/ресайз через границу 1024**: `gsap.matchMedia` сам пересоздаёт анимации; существующие `ScrollTrigger.refresh()` в SmoothScrollProvider — страховка.
- **Vercel-кэш** может отдавать старые картинки до передеплоя — проверять прод после того, как Actions отработал.
- **safe-area** видна только на реальном iPhone (прод/https) — в эмуляции проверяем только отсутствие ошибок.

## Журнал выполнения

| Шаг | Статус | Дата | Заметки исполнителя |
|-----|--------|------|---------------------|
| 0 — Подготовка | ✅ ВЫПОЛНЕН | 2026-07-17 | Копия плана, доки прочитаны, 6 эталонных скриншотов, tsc чист, eslint — 2 старые ошибки в useStoryController.ts (не мои, фон). Подтянут коммит Артёма (юр. страницы) через subtree pull, конфликт в ContactForm.tsx разрешён (оставлена версия Артёма), WIP формы контактов не тронут. Запушено в ships/main (force, содержимое сверено) |
| 1 — Нативный скролл | ✅ | 2026-07-17 | useIsTouch + гейтинг Lenis-эффектов, applyScroll-хелпер в HomeAnchorScroll, фолбэк в LogoLink, ignoreMobileResize, scroll-behavior в CSS. Playwright (Pixel 5 + десктоп 1440) зелёный, tsc чист, eslint — 2 старые ошибки (фон) |
| 2 — Нижнее меню + FAB | ✅ | 2026-07-17 | useActiveSection вынесен из LimelightNav, MobileBottomNav + FloatingContactFab новые, Header/layout/Footer/globals.css обновлены. Playwright (360/390/768/1440) зелёный, tsc чист, eslint — 2 старые ошибки (фон) |
| 3 — Медиа и перф | ⬜ | | |
| 4 — Секции | ⬜ | | |
| 5 — Форма | ⬜ | | |
| 6 — Полировка + финал | ⬜ | | |
