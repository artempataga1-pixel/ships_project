import type { CSSProperties } from 'react'

/* Бесконечная бегущая строка — референс landonorris.com, полоса лого
   спонсоров идёт по всей ширине без остановки. Контент дублируется x2,
   лента едет ровно на половину своей ширины (translateX(-50%)) — переход
   к повтору незаметен. Секция «Контакты» кладёт эту ленту НИЖЕ по
   z-index, чем вырезанные фото учредителей, — там, где силуэт человека
   перекрывает строку, она просто визуально скрыта его непрозрачными
   пикселями, а по бокам продолжает бежать без прерывания. */

interface MarqueeProps {
  items: string[]
  duration?: number
  className?: string
  itemClassName?: string
  separator?: string
}

export function Marquee({ items, duration = 30, className, itemClassName, separator = '·' }: MarqueeProps) {
  return (
    <div className={className}>
      <span className="sr-only">{items.join(', ')}</span>
      <div className="overflow-hidden" aria-hidden="true">
        <div
          className="flex w-max items-center animate-marquee"
          style={{ '--duration': duration } as CSSProperties}
        >
          {[0, 1].map((group) => (
            <div key={group} className="flex items-center shrink-0">
              {items.map((item, i) => (
                <span key={`${group}-${i}`} className={`whitespace-nowrap ${itemClassName ?? ''}`}>
                  {item}
                  <span className="mx-6 md:mx-10 text-white/15" aria-hidden="true">
                    {separator}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
