'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { whenIntroDone } from '@/lib/introGate'

/* Последовательная сборка первого экрана (ТЗ 27.09.2026, раздел 1):
   1) крупно по центру экрана появляется «Превращаем»;
   2) слово уменьшается и уезжает на своё место в заголовке (FLIP — layout не
      трогаем, только transform от финальной позиции);
   3) слева направо проявляется «сложное в ясное» — маска с мягкой кромкой
      (.hero-wipe в globals.css, двигаем --wipe). Ниже xl это две строки
      («сложное» / «в ясное») — шторка идёт по ним по очереди, скорость по
      ширине, поэтому на десктопе, где они в одну строку, проход сплошной;
   4) внизу проявляются подстрочник и строка-бренд.
   После — всё стоит в собранном виде, инлайн-стили снимаются.

   Разметку даёт HeroLayer: [data-hero-word], [data-hero-wipe] (1–2 шт.),
   [data-hero-tail] (бренд + подстрочник).

   Старт — когда одновременно: ушло лого-интро (whenIntroDone), сцена готова
   (ready — лоадер видео снят) и загружены шрифты (иначе замер FLIP врёт).
   Скролл/тап во время сборки — ускоряем до конца, чтобы при возврате на первый
   экран текст уже стоял. Заход по якорю на другой шаг (/#partners и т.п.) —
   первый экран не виден, сборку не играем вовсе. Reduced-motion — без анимации.

   Контроллеры скролла (useStoryController / useMobileScrubController) гасят
   оверлей героя целиком через его обёртку и во внутренние элементы не лезут —
   сборка с ними не пересекается. */

// Во сколько раз «Превращаем» крупнее финального в центре: целимся в долю
// ширины экрана, но в разумных пределах (на мобилке кегль маленький → ближе к
// верхнему пределу, на десктопе слово и так крупное).
const CENTER_WIDTH_SHARE = 0.62
const CENTER_SCALE_MIN = 1.15
const CENTER_SCALE_MAX = 2.2

export function useHeroAssembly(
  rootRef: React.RefObject<HTMLElement | null>,
  ready: boolean,
) {
  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      // CSS-прятка до гидрации больше не нужна: дальше видимостью рулим сами
      // (в том же синхронном layout-эффекте — пейнта между снятием и
      // gsap.set ниже нет).
      root.removeAttribute('data-hero-pending')

      const word = root.querySelector<HTMLElement>('[data-hero-word]')
      const wipes = gsap.utils.toArray<HTMLElement>('[data-hero-wipe]', root)
      const tail = gsap.utils.toArray<HTMLElement>('[data-hero-tail]', root)
      if (!word || !wipes.length) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      // Заход сразу на другой шаг сцены — первый экран пользователь не увидит.
      const hash = window.location.hash.slice(1)
      if (hash && hash !== 'hero') return

      // Исходное состояние — сразу (layout-эффект, до пейнта), даже пока сцена
      // не готова: иначе собранный текст мигнул бы в момент снятия лоадера.
      gsap.set(word, { autoAlpha: 0 })
      gsap.set(wipes, { '--wipe': '0%' })
      wipes.forEach((el) => el.classList.add('hero-wipe'))
      gsap.set(tail, { autoAlpha: 0, y: 18 })

      const dropWipeClass = () => wipes.forEach((el) => el.classList.remove('hero-wipe'))
      if (!ready) return dropWipeClass

      let tl: gsap.core.Timeline | null = null
      let cancelled = false
      let hurried = false
      let fontsTimer = 0
      let safetyTimer = 0
      const controller = new AbortController()

      // Собранное состояние без инлайн-хвостов: маска/transform больше не
      // нужны. Это же — аварийный выход (исключение, зависшие шрифты):
      // лучше показать текст без анимации, чем оставить первый экран пустым.
      const reveal = () => {
        tl?.kill()
        dropWipeClass()
        gsap.set(wipes, { clearProps: '--wipe' })
        gsap.set([word, ...tail], { clearProps: 'all' })
        window.clearTimeout(safetyTimer)
        controller.abort()
      }

      // Пользователь уже листает — дособираем быстро, без рывка. Слушаем с
      // момента готовности (а не старта), чтобы прокрутка ещё до старта сборки
      // тоже считалась: иначе, вернувшись на первый экран, можно застать
      // «Превращаем» посреди анимации.
      const hurry = () => {
        hurried = true
        if (tl && tl.progress() < 1) gsap.to(tl, { timeScale: 4, duration: 0.3, overwrite: true })
      }
      const opts = { passive: true, signal: controller.signal }
      window.addEventListener('wheel', hurry, opts)
      window.addEventListener('touchstart', hurry, opts)
      window.addEventListener('keydown', hurry, { signal: controller.signal })

      const build = () => {
        window.clearTimeout(fontsTimer)
        if (cancelled || tl) return
        try {
          play()
        } catch {
          reveal()
        }
      }

      const play = () => {
        // FLIP: центр слова → центр экрана (корень героя = весь экран сцены).
        const r = root.getBoundingClientRect()
        const w = word.getBoundingClientRect()
        const scale = gsap.utils.clamp(
          CENTER_SCALE_MIN,
          CENTER_SCALE_MAX,
          (r.width * CENTER_WIDTH_SHARE) / Math.max(w.width, 1),
        )
        const dx = r.left + r.width / 2 - (w.left + w.width / 2)
        const dy = r.top + r.height / 2 - (w.top + w.height / 2)

        // force3D: false — слово масштабируется ВНИЗ от увеличенного. На
        // композитном слое Chrome растрирует текст в финальном (мелком) кегле и
        // растягивает — в центре было бы мыло. 2D-transform перерисовывает
        // глифы на каждом кадре, для одного слова это дёшево.
        gsap.set(word, { x: dx, y: dy, scale, transformOrigin: '50% 50%', force3D: false })

        // Шторка по строкам — одна подвременная шкала с линейными отрезками,
        // длительность отрезка пропорциональна ширине строки; общий easing
        // накладываем на прогресс всей шкалы.
        const wipeTl = gsap.timeline({ paused: true })
        const widths = wipes.map((el) => el.getBoundingClientRect().width || 1)
        const total = widths.reduce((a, b) => a + b, 0)
        wipes.forEach((el, i) => {
          wipeTl.to(el, { '--wipe': '115%', duration: widths[i] / total, ease: 'none' })
        })

        tl = gsap.timeline({
          // Пауза под растворение лоадера сцены (transition 700мс в разметке).
          delay: 0.45,
          onComplete: reveal,
        })

        tl.to(word, {
          autoAlpha: 1,
          scale: scale * 1.04,
          duration: 0.9,
          ease: 'power2.out',
          force3D: false,
        })
          .to(word, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 1.15,
            ease: 'power3.inOut',
            force3D: false,
          }, '+=0.35')
          .to(wipeTl, { progress: 1, duration: 1.2, ease: 'power2.inOut' }, '-=0.3')
          .to(tail, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
          }, '-=0.35')

        // Уже листали до старта или страница открылась не на первом экране
        // (восстановленная позиция скролла на мобилке) — сразу быстрый темп.
        if (hurried || window.scrollY > 50) tl.timeScale(4)
      }

      const cancelGate = whenIntroDone(() => {
        // Шрифты — до замера, иначе ширина слова посчитается по фолбэку. Но не
        // дольше 1.5 с: fonts.ready ждёт ВСЕ загрузки шрифтов, на плохой сети
        // это может тянуться — лучше чуть неточный замер, чем пустой экран.
        fontsTimer = window.setTimeout(build, 1500)
        document.fonts.ready.then(build, build)
        // Последняя страховка: таймлайн так и не создан — показываем как есть.
        safetyTimer = window.setTimeout(() => {
          if (!tl && !cancelled) reveal()
        }, 4000)
      })

      return () => {
        cancelled = true
        cancelGate()
        window.clearTimeout(fontsTimer)
        window.clearTimeout(safetyTimer)
        controller.abort()
        tl?.kill()
        dropWipeClass()
      }
    },
    { scope: rootRef, dependencies: [ready], revertOnUpdate: true },
  )
}
