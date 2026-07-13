'use client'

import { useEffect } from 'react'
import { useLenis } from 'lenis/react'

/* Ставит скролл в самое начало при заходе на страницу. Нужен на /cases/[slug]:
   при переходе с главной Next обнуляет нативный scrollTop, но Lenis держит своё
   внутреннее значение с прошлой (длинной) страницы и уводит на произвольную
   позицию. Форсим 0 через Lenis API (force — Lenis на смене страницы
   остановлен), и повторяем после его перезапуска (~350мс), чтобы он не увёл
   обратно. */
export function ScrollTopOnLoad() {
  const lenis = useLenis()

  useEffect(() => {
    const toTop = () => {
      lenis?.scrollTo(0, { immediate: true, force: true })
      window.scrollTo(0, 0)
    }
    toTop()
    const t = window.setTimeout(toTop, 400)
    return () => window.clearTimeout(t)
  }, [lenis])

  return null
}
