import { Phone } from 'lucide-react'

// Плавающая круглая кнопка связи (FAB) до 1024px — тап ведёт к форме контактов
export function FloatingContactFab() {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages -- намеренно нативный <a>: на главной клик перехватывает Lenis/нативный скролл к #contacts, Link здесь не нужен
    <a
      href="/#contacts"
      aria-label="Связаться с нами"
      className="btn-lime-fill lg:hidden fixed right-4 z-[89] flex items-center justify-center w-14 h-14 rounded-full"
      style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom) + 0.75rem)' }}
    >
      <Phone className="w-6 h-6" aria-hidden />
    </a>
  )
}
