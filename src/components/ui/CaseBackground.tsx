'use client'

import { useEffect, useState } from 'react'

const DESKTOP_MEDIA = '(min-width: 1024px)'

/* --- Фоновое видео кейса: бесшовный пинг-понг (16с — вперёд + реверс,
       склеено ffmpeg, оттого loop без рывка). Тихое, автоплей.

       Постер — СВОЙ кадр этого видео (poster_wall.jpg), а не общий
       poster_start.jpg: тот был первым кадром story1.mp4, то есть кадром героя
       ГЛАВНОЙ. Пока case-bg-loop.mp4 (2.7МБ) долетал, страница практики на долю
       секунды показывала чужую картинку — глазу заметно. --- */
export function CaseBackground() {
  // SSR-safe: по умолчанию постер (без JS ни байта видео не грузится).
  // На маунте апгрейдим до видео, если экран ≥1024px. Следим за ресайзом/
  // поворотом через границу 1024, чтобы <video> не оставался в DOM на мобиле.
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA)
    const apply = () => setIsDesktop(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  if (!isDesktop) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: 'url(/video/poster_wall.jpg)' }}
      />
    )
  }

  return (
    <video
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/video/poster_wall.jpg"
    >
      <source src="/video/case-bg-loop.mp4" type="video/mp4" />
    </video>
  )
}
