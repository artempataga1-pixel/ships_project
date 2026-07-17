import { useSyncExternalStore } from 'react'

// Гибридные ноутбуки с тачскрином (hover доступен) остаются «десктопом» —
// проверяем оба условия, не только pointer:coarse.
const QUERY = '(hover: none) and (pointer: coarse)'

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

// SSR и первый клиентский рендер до гидратации — всегда «не тач» (десктоп),
// апгрейд происходит синхронно после маунта (useSyncExternalStore сам
// перерендерит, если снапшот успел разойтись с серверным).
function getServerSnapshot() {
  return false
}

export function useIsTouch(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
