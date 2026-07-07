/** Склейка классов без зависимостей (аналог clsx для простых случаев) */
export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ')
}
