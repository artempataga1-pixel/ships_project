# Новый hero-блок с курсор-прожектором + limelight-хедер (project-yuriki)

## Контекст

Главная страница сейчас открывается видео `hero-transform.mp4`. Заменяем на «вирусный» эффект: статичная картинка тёмного юридического кабинета (`fonstart.jpeg`), а вокруг курсора через мягкую круглую маску «проявляется» невидимое видео с мерцающими искрами (`fonfinal.mp4`). На столе слева — белая надпись «Когда на чашах весов стоит будущее — важна каждая деталь» шрифтом Playfair Display italic с отражением от столешницы. Хедер редизайним в стиле референса Lithos: прозрачный fixed, по центру «пилюля» с пунктами меню и limelight-лампой, которая плавно переезжает к активной/наведённой вкладке.

**Решения пользователя:** из старого hero убираем всё (заголовок, фразу, кнопку); Playfair — только для надписи в hero; хедер — пилюля из первого промпта + лампа из limelight; мобилку пока не делаем.

## ⚠ Ключевые находки разведки

- **fonfinal.mp4 — это HEVC (H.265) 4K 3840×2160.** Firefox его не играет вообще, Chrome — только с аппаратным декодером. Транскод в H.264 1080p — **обязателен**, не опционален. ffmpeg 8.1.1 в системе есть.
- **Аспекты не совпадают:** jpeg 2752×1536 (1.792) vs видео 16:9 (1.778) → при object-cover слои разъедутся на ~1%, на границе прожектора будет «двоение». Кропаем jpeg до 16:9; если кадры всё равно не совпадут — извлекаем кадр 0 из видео как базу.
- **Компенсация sticky→fixed НЕ нужна:** внутренние страницы уже имеют свой `py-32` (128px) — перекрывает хедер. Hero сознательно уходит под прозрачный хедер. Глобальный pt на main всё бы сломал.
- **page.tsx станет серверным:** `'use client'` там был только ради hero-анимаций и Lenis-кнопки — всё это удаляется.
- **React 19:** ref-callback не должен возвращать значение — `ref={(el) => { itemRefs.current[i] = el }}` с фигурными скобками.
- **LogoIntro нигде не смонтирован** (dead code), но хедеру даём `z-[90]` (а не z-[100]), чтобы если LogoIntro вернут — его оверлей был поверх. `data-header-logo` на логотипе сохранить.

## Шаги

### 1. Ассеты (ffmpeg, до кода)

**✅ Видео уже пережато (не делать заново!):** в `public/video/` лежат две адаптивные версии, обе H.264, CRF 24, без звука, faststart:
- `hero-spotlight-1080.mp4` — 1920×1080, ~1.4 МБ (обычные мониторы);
- `hero-spotlight-2k.mp4` — 2560×1440, ~2.2 МБ (2K/4K/ретина).

**Осталось сделать:**

```
ffmpeg -i "reference 2/fonstart.jpeg" -vf "crop=2731:1536" -q:v 3 public/images/backgrounds/hero-base.jpg
```

Удалить `public/video/hero-transform.mp4`. Визуально сверить совпадение кадров jpeg и видео; при расхождении — база = кадр 0 из видео (`ffmpeg -frames:v 1`).

### 2. Шрифт Playfair Display

`src/app/layout.tsx`: `Playfair_Display({ subsets: ['latin', 'cyrillic'], style: 'italic', variable: '--font-playfair-var', display: 'swap' })` (именно `style: 'italic'` — иначе faux-italic), переменную в className html. `globals.css` → в `@theme`: `--font-playfair: var(--font-playfair-var), serif;` (даёт класс `font-playfair`).

### 3. Контент и типы

`src/constants/content/home.ts`: `HERO = { phrase: 'Когда на чашах весов стоит будущее — важна каждая деталь' }` (heading/ctaLabel удалить). `src/types/content.ts`: `HeroContent = { phrase: string }`.

### 4. Новый `src/components/hero/SpotlightHero.tsx` ('use client')

Секция `relative h-dvh overflow-hidden`, слои:

1. **z-10 база:** `<Image src="/images/backgrounds/hero-base.jpg" fill priority className="object-cover" sizes="100vw">`.
2. **z-30 видео-прожектор:** рендерится только при `showVideo` (state, ставится в `useEffect` по `matchMedia('(hover: hover) and (pointer: fine)')` — иначе hydration mismatch; на тачах слой не монтируется вовсе). **Адаптивный выбор видео** — в том же `useEffect` выбрать src по физическому разрешению экрана и положить в state:
   `const src = window.innerWidth * window.devicePixelRatio > 2200 ? '/video/hero-spotlight-2k.mp4' : '/video/hero-spotlight-1080.mp4'` (devicePixelRatio обязателен — ретина-ноутбук с окном 1440 CSS-px физически 2880px и должен получить 2K-версию). Div-обёртка со стилем:
   `maskImage/WebkitMaskImage: radial-gradient(circle 260px at var(--mx,-999px) var(--my,-999px), rgb(0 0 0) 0%, rgb(0 0 0 / .85) 55%, transparent 100%)` + `transform: translateZ(0)`. Внутри `<video src={src} autoPlay muted loop playsInline preload="auto" aria-hidden disablePictureInPicture className="h-full w-full object-cover">` + страховочный `videoRef.play().catch()` в эффекте.
   Координаты: `onPointerMove` на секции пишет target в ref (через `getBoundingClientRect` прямо в обработчике); лерп `x += (tx - x) * 0.1` — на **`gsap.ticker.add`** (общий тик с Lenis, не свой rAF), обновление `--mx/--my` через `style.setProperty` на обёртке видео — ноль ре-рендеров. Cleanup: `gsap.ticker.remove`. Старт `-999px` — прожектор невидим до первого движения.
   Если на верификации jank — план Б: движимое «окно» 520×520 со статичной маской и инверсным translate видео (compositor-only).
3. **z-50 надпись на столе:** wrapper `absolute left-[6%] bottom-[16%] max-w-[38%] pointer-events-none`:
   - `<p className="font-playfair italic text-white text-3xl/[1.35] ...">` фраза из HERO;
   - отражение: дубликат `aria-hidden select-none`, `scaleY(-1)`, opacity 0.22, blur 2px, `maskImage: linear-gradient(to top, black 30%, transparent 90%)`;
   - появление через `useGSAP`: wrapper целиком opacity 0→1, y 28→0, blur 12→0, ~1.1s power3.out, delay 0.4s; reduced-motion через `gsap.matchMedia()` → сразу конечное состояние.

### 5. `src/app/page.tsx`

Убрать `'use client'`, весь hero-JSX (видео, градиент, h1/p/button), refs, useGSAP, useLenis и лишние импорты. Вставить `<SpotlightHero />` перед секцией `#about`. Остальное не трогать.

### 6. Новый `src/components/layout/LimelightNav.tsx` ('use client')

Пропсы `{ items: NavItem[] }`. Состояние: `hoveredIndex`, `lamp: {x, width} | null`, `isReady`. `activeIndex` из `usePathname()`; `targetIndex = hoveredIndex ?? (activeIndex >= 0 ? activeIndex : null)`.

- `useLayoutEffect([targetIndex])`: замер `offsetLeft/offsetWidth` → `setLamp`; после первого замера `requestAnimationFrame(() => setIsReady(true))` (первый кадр — без transition-переезда). Resize-listener → перезамер.
- `<ul>` с пунктами `<Link>` (`px-4 py-1.5 rounded-full text-sm`, активный/hovered `text-white`, остальные `text-white/70`), `onMouseEnter` на li, `onMouseLeave` на ul → возврат лампы к активному.
- **Лампа:** div `absolute top-0 -translate-y-1/2 w-11 h-[5px] rounded-full`, цвет + свечение `rgba(170,210,255,…)` (--color-accent-cold) + box-shadow; позиция через `transform: translateX(...)` (composite-only, не `left`); `transition: transform .4s, opacity .3s` только при isReady; `opacity: 0` пока `targetIndex === null || lamp === null` (страницы вне меню — лампа скрыта до hover). Внутри — конус света вниз: `clip-path: polygon(5% 100%, 25% 0, 75% 0, 95% 100%)`, `linear-gradient(to bottom, rgba(170,210,255,0.4), transparent)`, `h-11 w-14`, pointer-events-none.

### 7. `src/components/layout/Header.tsx` (остаётся серверным)

`<header className="fixed top-0 inset-x-0 z-[90]">` без фоновой плашки → контейнер `h-16 px-8 flex items-center justify-between`:
- слева логотип как есть (+ `data-header-logo`);
- центр: пилюля `relative rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-2` (**без overflow-hidden** — лампа выступает над кромкой) с `<LimelightNav items={NAV_ITEMS} />`;
- справа «Связаться» → `/contacts`: белая пилюля `bg-white text-[#262424] text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/85`.

Удалить `src/components/layout/NavLanternItem.tsx`, `src/contexts/NavContext.tsx` (+ пустой каталог `src/contexts`) — grep подтвердил, что используются только в Header.

### 8. Сверка внутренних страниц

/team, /practice, /cases, /media, /benefit, /contacts — `py-32` перекрывает хедер, но проверить глазами. `scroll-margin-top: 64px` в globals.css сверить с фактической высотой хедера.

## Верификация

1. `npm run dev` + Playwright MCP:
   - главная: база на весь экран, надпись с отражением слева на столе, пилюля поверх, старого hero нет;
   - движение мыши по hero → два скриншота в разных точках: видео (искры) проявляется кругом у курсора, слои не «двоятся» на границе;
   - hover по пунктам → лампа плавно переезжает, конус светится холодным; mouseleave → возврат; переход /team → лампа на «Команда»;
   - внутренние страницы: контент не залезает под хедер;
   - консоль без ошибок (hydration, autoplay, video decode); network: играет `hero-spotlight-1080.mp4` или `-2k.mp4` в зависимости от разрешения (проверить оба через эмуляцию deviceScaleFactor).
2. Reduced-motion (CDP-эмуляция) — текст появляется без анимации.
3. `npm run build` — чисто.

## Файлы

| Действие | Путь |
|---|---|
| создать | `src/components/hero/SpotlightHero.tsx`, `src/components/layout/LimelightNav.tsx` |
| изменить | `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/layout/Header.tsx`, `src/constants/content/home.ts`, `src/types/content.ts` |
| удалить | `src/components/layout/NavLanternItem.tsx`, `src/contexts/NavContext.tsx`, `public/video/hero-transform.mp4` |
| ассеты | ✅ готово: `public/video/hero-spotlight-1080.mp4` + `hero-spotlight-2k.mp4`; осталось: fonstart.jpeg → кроп 16:9 `public/images/backgrounds/hero-base.jpg` |
