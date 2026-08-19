'use client'

import Link from 'next/link'
import type { ComponentProps, MouseEvent } from 'react'

/* Ссылка на внутреннюю страницу (карточка практики/кейса на главной), которая
   перед уходом «подписывает» текущую запись истории якорем этой карточки.

   Зачем: возврат к карточке целиком построен на хэше главной — /#practice-<slug>
   или /#case-<slug>. По нему HomeAnchorScroll довозит скролл до карточки, а
   useStoryController стартует отпущенным (иначе стори запирает страницу на нуле).
   Лаймовая кнопка «Все практики/Все кейсы» ведёт именно на такой URL, поэтому
   работает верно. А браузерная кнопка «Назад» возвращает НЕ на новый URL, а ровно
   на ту запись истории, с которой ушли: там был чистый «/» без хэша — стори
   видела пустой hash, запиралась на нуле и выкидывала пользователя на герой.

   Лечение: в момент клика по карточке заменяем URL текущей (главной) записи
   истории на «/#<якорь карточки>». Навигация вперёд от этого не меняется
   (replaceState не создаёт запись, не скроллит и не шлёт hashchange), а back
   теперь приземляет на главную с тем же хэшем, что и лаймовая кнопка, — путь
   возврата у обеих кнопок становится общим.

   history.state передаём как есть: у app-router в нём лежит внутреннее дерево
   роутера (__NA/__PRIVATE_NEXTJS_INTERNALS_TREE). Во-первых, без него popstate
   у Next не найдёт состояние и перезагрузит страницу целиком; во-вторых, его
   патч replaceState по флагу __NA пропускает вызов напрямую в нативный метод —
   без лишнего ACTION_RESTORE-рендера роутера, нам нужен только адрес. */
type Props = ComponentProps<typeof Link> & {
  /* Якорь карточки на главной, вместе с решёткой: «#practice-bankrotstvo» */
  returnHash: string
}

export function rememberReturnAnchor(hash: string) {
  if (typeof window === 'undefined') return
  // Карточки живут только на главной, но подстраховываемся: чужую страницу
  // переписывать нечем — там этого якоря нет.
  if (window.location.pathname !== '/') return
  if (window.location.hash === hash) return
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}${hash}`
  )
}

export function ReturnAnchorLink({ returnHash, onClick, ...rest }: Props) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    // Открытие в новой вкладке/окне (Ctrl/Cmd/Shift/Alt, средняя кнопка) —
    // текущая вкладка остаётся на главной и никуда не уходит, помечать её
    // запись якорем не за чем.
    const opensElsewhere =
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0
    if (e.defaultPrevented || opensElsewhere) return
    rememberReturnAnchor(returnHash)
  }

  return <Link {...rest} onClick={handleClick} />
}
