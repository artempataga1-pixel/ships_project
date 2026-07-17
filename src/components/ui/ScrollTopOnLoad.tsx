'use client'

import { useEffect } from 'react'
import { useLenis } from 'lenis/react'

/* Ставит скролл в самое начало при заходе на страницу. Нужен на /cases/[slug]:
   при переходе с главной Next обнуляет нативный scrollTop, но Lenis держит своё
   внутреннее значение с прошлой (длинной) страницы и уводит на произвольную
   позицию. Форсим 0 через Lenis API (force — Lenis на смене страницы
   остановлен), и повторяем после его перезапуска (~350мс), чтобы он не увёл
   обратно. Если в URL есть якорь (например /privacy-policy#consent — ссылка
   из чекбокса формы), скроллим к нему, а не к 0. */
export function ScrollTopOnLoad() {
  const lenis = useLenis()

  useEffect(() => {
    const hash = window.location.hash
    const target = hash ? document.getElementById(hash.slice(1)) : null

    const toPosition = () => {
      if (target) {
        lenis?.scrollTo(target, { immediate: true, force: true })
        target.scrollIntoView({ behavior: 'instant', block: 'start' })
      } else {
        lenis?.scrollTo(0, { immediate: true, force: true })
        window.scrollTo(0, 0)
      }
    }
    toPosition()
    const t = window.setTimeout(toPosition, 400)
    return () => window.clearTimeout(t)
  }, [lenis])

  return null
}
