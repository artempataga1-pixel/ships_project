import type { CSSProperties } from 'react'

/* Фирменная подложка карточки — замена декоративному видео из референса.

   Для продуктов и кейсов своих изображений нет и быть не должно: подбирать
   юридическим кейсам стоковые фотографии — ровно тот приём, от которого сайт
   уходит. Поэтому вместо кадра — фирменная графика: мягкий лайм-градиент плюс
   контурная лого-скобка, тот же декор, что в фонах CasesSection и героя
   практики. Ноль сетевых запросов, мгновенная отрисовка, узнаваемая стилистика.

   Четыре варианта (variant 0..3, дальше по кругу) — чтобы соседние карточки
   в сетке не выглядели штампованными. */

const TONES: { base: string; glow: string; corner: string }[] = [
  {
    base: 'linear-gradient(142deg, #f7faf0 0%, #eef4df 58%, #e7eed4 100%)',
    glow: 'radial-gradient(120% 90% at 18% 12%, rgba(185,230,41,.34), transparent 62%)',
    corner: 'right-6 top-6',
  },
  {
    base: 'linear-gradient(210deg, #fafbf6 0%, #f1f4ea 54%, #e9efdd 100%)',
    glow: 'radial-gradient(110% 86% at 82% 18%, rgba(185,230,41,.28), transparent 60%)',
    corner: 'left-6 bottom-6',
  },
  {
    base: 'linear-gradient(118deg, #f5f8ee 0%, #edf2e1 62%, #e4ecd2 100%)',
    glow: 'radial-gradient(130% 94% at 30% 88%, rgba(185,230,41,.30), transparent 64%)',
    corner: 'right-6 bottom-6',
  },
  {
    base: 'linear-gradient(168deg, #fbfcf8 0%, #f2f5ec 50%, #e8efda 100%)',
    glow: 'radial-gradient(116% 88% at 70% 86%, rgba(185,230,41,.26), transparent 58%)',
    corner: 'left-6 top-6',
  },
]

/* Контурная лого-скобка: угловые border-рамки + три бара, тот же декор, что в
   фонах CasesSection и героя практики.

   Пропорции взяты от LogoOutline и ужаты втрое (230px → 78px): в полный размер
   знак занимал половину карточки и, обрезанный её краем, читался не как
   логотип, а как случайные палки поперёк подложки. Мелкий и целиком в кадре он
   работает как задумано — тихой фирменной меткой в углу. */
function LogoMark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute h-[78px] w-[78px] opacity-[0.16] ${className ?? ''}`}
    >
      <span
        className="absolute bottom-0 left-0 h-[46px] w-[29px] border-b border-l"
        style={{ borderColor: 'var(--color-lime-ink)' }}
      />
      <span
        className="absolute right-0 top-0 h-[46px] w-[29px] border-r border-t"
        style={{ borderColor: 'var(--color-lime-ink)' }}
      />
      {[26, 42, 58].map((left) => (
        <span
          key={left}
          className="absolute bottom-[22px] h-[40px] w-[9px] border"
          style={{ left, borderColor: 'var(--color-lime-ink)' }}
        />
      ))}
    </div>
  )
}

export function CardArtwork({ variant = 0, style }: { variant?: number; style?: CSSProperties }) {
  const tone = TONES[variant % TONES.length]

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: tone.base, ...style }}
    >
      <div className="absolute inset-0" style={{ background: tone.glow }} />
      <LogoMark className={tone.corner} />
    </div>
  )
}
