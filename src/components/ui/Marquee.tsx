import type { CSSProperties, ReactNode } from 'react'

/* Бесконечная бегущая строка — референс landonorris.com. Контент
   дублируется x2, лента едет ровно на половину своей ширины
   (translateX(-50%)) — переход к повтору незаметен. */

interface MarqueeProps {
  items: ReactNode[]
  duration?: number
  className?: string
  itemClassName?: string
  separator?: ReactNode
  /** Текст для скринридеров — дублированные визуальные элементы скрыты через aria-hidden */
  srLabel?: string
}

export function Marquee({ items, duration = 30, className, itemClassName, separator = '·', srLabel }: MarqueeProps) {
  return (
    <div className={className}>
      {srLabel && <span className="sr-only">{srLabel}</span>}
      <div className="overflow-hidden" aria-hidden={srLabel ? 'true' : undefined}>
        <div
          className="flex w-max items-center animate-marquee"
          style={{ '--duration': duration } as CSSProperties}
        >
          {[0, 1].map((group) => (
            <div key={group} className="flex items-center shrink-0">
              {items.map((item, i) => (
                <span key={`${group}-${i}`} className={`flex items-center whitespace-nowrap ${itemClassName ?? ''}`}>
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
