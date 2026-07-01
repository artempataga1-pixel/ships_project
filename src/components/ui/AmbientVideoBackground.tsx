'use client'

interface AmbientVideoBackgroundProps {
  src: string
  opacity?: number
}

// Монтировать только один раз на страницу (через page.tsx, не layout)
export function AmbientVideoBackground({
  src,
  opacity = 0.12,
}: AmbientVideoBackgroundProps) {
  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className="fixed inset-0 w-full h-full object-cover -z-10 pointer-events-none"
      style={{ opacity }}
    />
  )
}
