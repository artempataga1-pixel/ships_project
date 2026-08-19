'use client'

import { useEffect, useRef, useState } from 'react'

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
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA)
    const apply = () => setIsDesktop(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  /* Пауза, когда задник ушёл из вида.

     На странице практики задник стоит position: fixed внутри секции-героя с
     ненулевым clip-path: физически он обрезан границами героя, но для
     браузера остаётся элементом во вьюпорте — то есть ролик (2.7 МБ)
     продолжал декодироваться всё время, пока открыта страница, а она ~4800px
     и герой виден только на первом экране.

     Наблюдать за самим <video> бесполезно ровно по этой причине — fixed
     всегда «пересекает» вьюпорт. Наблюдаем за тем, кто его ограничивает:
     ищем ближайшего предка с ненулевым clip-path (он же containing block для
     fixed-потомка). Не нашли — берём непосредственного родителя: так задник
     страницы кейса, где он обычный absolute, остаётся при прежнем поведении.

     play() отдаёт промис, который отклоняется, если элемент к тому моменту
     убрали или автоплей заблокирован — глушим, это штатный случай. */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let bounds: HTMLElement | null = video.parentElement
    for (let el = video.parentElement; el && el !== document.body; el = el.parentElement) {
      if (getComputedStyle(el).clipPath !== 'none') {
        bounds = el
        break
      }
    }
    if (!bounds) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {})
      else video.pause()
    })
    observer.observe(bounds)
    return () => observer.disconnect()
  }, [isDesktop])

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
      ref={videoRef}
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
