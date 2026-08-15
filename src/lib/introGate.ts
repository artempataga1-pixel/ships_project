/* Гейт «дождаться конца лого-интро».

   LogoIntro (см. src/components/ui/LogoIntro.tsx) держит оверлей во весь экран
   около трёх секунд и проигрывается один раз за сессию. Анимации героя стартуют
   на монтировании — и при прямом заходе на страницу (не переходом с главной)
   они целиком отыгрывали ПОД оверлеем: пользователь дожидался интро и получал
   уже статичный текст. Именно на такой заход попадает любая присланная ссылка.

   Флаг в sessionStorage ставит сам LogoIntro — и когда интро отыграло, и когда
   решило не играть (повторный визит, prefers-reduced-motion). Флаг есть —
   запускаемся сразу; флага нет — ждём событие о завершении.

   Таймаут — страховка от залипания: если LogoIntro по какой-то причине не
   доиграет и события не будет, анимация всё равно запустится, а не оставит
   текст скрытым навсегда. */

const FLAG = 'logo-intro-played'
export const INTRO_DONE_EVENT = 'logo-intro:done'

/** Ставит колбэк в очередь на «после интро». Возвращает функцию отмены. */
export function whenIntroDone(run: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  // Приватный режим/заблокированное хранилище: считаем, что ждать нечего.
  let played = true
  try {
    played = Boolean(window.sessionStorage.getItem(FLAG))
  } catch {
    played = true
  }
  if (played) {
    run()
    return () => {}
  }

  let settled = false
  const fire = () => {
    if (settled) return
    settled = true
    clear()
    run()
  }
  const timer = window.setTimeout(fire, 4200)
  const clear = () => {
    window.clearTimeout(timer)
    window.removeEventListener(INTRO_DONE_EVENT, fire)
  }
  window.addEventListener(INTRO_DONE_EVENT, fire, { once: true })

  return () => {
    settled = true
    clear()
  }
}
