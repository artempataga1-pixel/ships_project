'use client'

import { FileCheck, ShieldCheck, FileText, Download } from 'lucide-react'
import type { Benefit } from '@/types/content'

const iconMap = {
  FileCheck,
  ShieldCheck,
  FileText,
} as const

interface BenefitCardProps {
  item: Benefit
}

export function BenefitCard({ item }: BenefitCardProps) {
  const Icon = iconMap[item.icon]

  return (
    <div
      className="
        group flex flex-col gap-6 p-8 rounded-lg
        border border-[var(--color-card-border)]/40
        bg-gradient-to-b from-zinc-800 to-zinc-900
        transition-all duration-300
        hover:border-[var(--color-card-border)]
        hover:shadow-[0_0_28px_rgba(119,99,75,0.25)]
      "
    >
      {/* Иконка */}
      <div
        className="
          w-14 h-14 rounded-lg flex items-center justify-center
          border border-[var(--color-card-border)]/40
          text-[var(--color-accent-cold)]
          transition-colors duration-300
          group-hover:border-[var(--color-card-border)]
        "
      >
        {Icon && <Icon size={28} strokeWidth={1.5} />}
      </div>

      {/* Текст */}
      <div className="flex-1 flex flex-col gap-3">
        <h3
          className="
            font-heading text-xl font-extrabold leading-snug
            transition-colors duration-300
            group-hover:text-[var(--color-accent-cold)]
          "
        >
          {item.title}
        </h3>
        <p className="text-sm text-white/55 leading-relaxed">{item.desc}</p>
      </div>

      {/* Кнопка */}
      <button
        type="button"
        disabled
        className="
          flex items-center gap-2 w-fit
          text-sm text-[var(--color-accent-cold)]/40
          border border-[var(--color-accent-cold)]/15 rounded
          px-4 py-2.5
          cursor-not-allowed opacity-50
        "
      >
        <Download size={14} strokeWidth={2} />
        Скачать
      </button>
    </div>
  )
}
