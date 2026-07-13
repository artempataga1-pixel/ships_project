'use client'

import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { LenisRef } from 'lenis/react'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)
  const pathname = usePathname()

  useEffect(() => {
    function update(time: number) {
      // GSAP ticker: секунды → Lenis.raf(): миллисекунды
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])

  // Пересчёт позиций ScrollTrigger после того, как раскладка устаканится. Без
  // этого триггеры кешируют стартовые точки на раннем кадре, а затем подгрузка
  // шрифтов/видео и раскрытие пинов (Практики/Статьи) сдвигают высоты секций. На
  // высоких/широких экранах накопленный сдвиг достаточен, чтобы reveal-триггеры
  // нижних секций (Контакты) промахнулись и остались невидимыми. Refresh НЕ зависит
  // от готовности Lenis — иначе на раннем маунте (lenis ещё null) не выполнится.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    // Догоняющие пересчёты: раскладка/шрифты могут устаканиться уже после load.
    const timers = [requestAnimationFrame(refresh), window.setTimeout(refresh, 600)]
    return () => {
      window.removeEventListener('load', refresh)
      cancelAnimationFrame(timers[0])
      window.clearTimeout(timers[1])
    }
  }, [])

  // Связка Lenis ↔ ScrollTrigger.update. Lenis появляется после первого коммита,
  // поэтому ждём его в микро-поллинге, а не читаем один раз (тогда был бы null).
  useEffect(() => {
    let raf = 0
    let attached: LenisRef['lenis'] | null = null
    const onScroll = () => ScrollTrigger.update()
    const attach = () => {
      const lenis = lenisRef.current?.lenis
      if (lenis) {
        attached = lenis
        lenis.on('scroll', onScroll)
      } else {
        raf = requestAnimationFrame(attach)
      }
    }
    attach()
    return () => {
      cancelAnimationFrame(raf)
      attached?.off('scroll', onScroll)
    }
  }, [])

  // При смене страницы: останавливаем Lenis на время fade-transition (300ms),
  // чтобы скролл не конфликтовал со снимком View Transitions API
  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return
    lenis.stop()
    const id = setTimeout(() => lenis.start(), 350)
    return () => clearTimeout(id)
  }, [pathname])

  return (
    // anchors: клики по <a href="#..."> плавно скроллят к секции;
    // высоту header компенсирует scroll-margin-top у секций (globals.css)
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, anchors: true }}>
      {children}
    </ReactLenis>
  )
}
