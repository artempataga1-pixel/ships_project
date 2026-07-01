import { AmbientVideoBackground } from '@/components/ui/AmbientVideoBackground'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { TEAM } from '@/constants/content/team'

// Server Component — не добавлять 'use client' (сломает metadata)
export const metadata = {
  title: 'Команда — Шумская и Партнёры',
}

function SilhouetteIcon() {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-16 h-20 opacity-30"
      aria-hidden="true"
    >
      <circle cx="50" cy="35" r="22" fill="white" />
      <path
        d="M10 120 C10 85 90 85 90 120 Z"
        fill="white"
      />
    </svg>
  )
}

export default function TeamPage() {
  return (
    <>
      <AmbientVideoBackground src="/video/infograf1.mp4" opacity={0.12} />

      <main className="max-w-[1440px] mx-auto px-16 py-32">
        {/* SectionHeading содержит собственную ScrollTrigger-анимацию (SplitText lines) */}
        <SectionHeading
          title="Наша команда"
          subtitle="Профессионалы с многолетним опытом в ключевых отраслях права"
        />

        <div className="mt-20 grid grid-cols-5 gap-6">
          {TEAM.map((member, i) => (
            <RevealOnScroll key={member.name} delay={i * 0.1}>
              <Card className="overflow-hidden">
                {/* Silhouette area */}
                <div className="w-full aspect-[3/4] bg-gradient-to-b from-zinc-700 to-zinc-900 flex items-end justify-center pb-8">
                  <SilhouetteIcon />
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="font-heading text-base font-extrabold leading-snug">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/50">
                    {member.role}
                  </p>
                </div>
              </Card>
            </RevealOnScroll>
          ))}
        </div>
      </main>
    </>
  )
}
