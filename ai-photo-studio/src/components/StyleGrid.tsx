'use client'

import {
  Leaf,
  Droplets,
  Brush,
  Film,
  Sparkles,
  Zap,
  Pencil,
  Sun,
  Clapperboard,
  Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STYLES = [
  { id: 'ghibli', name: 'Studio Ghibli', icon: Leaf },
  { id: 'watercolor', name: 'Акварель', icon: Droplets },
  { id: 'oil-painting', name: 'Масло', icon: Brush },
  { id: 'vintage', name: 'Ретро', icon: Film },
  { id: 'anime', name: 'Аниме', icon: Sparkles },
  { id: 'cyberpunk', name: 'Киберпанк', icon: Zap },
  { id: 'sketch', name: 'Карандаш', icon: Pencil },
  { id: 'golden-hour', name: 'Золотой час', icon: Sun },
  { id: 'cinematic-bw', name: 'Нуар', icon: Clapperboard },
  { id: 'fairy-tale', name: 'Сказка', icon: Wand2 },
]

interface StyleGridProps {
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

export function StyleGrid({ value, onChange, disabled }: StyleGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {STYLES.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(id)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors',
            'disabled:pointer-events-none disabled:opacity-50',
            value === id
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:border-primary/40 hover:bg-muted/30'
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="text-xs font-medium leading-tight">{name}</span>
        </button>
      ))}
    </div>
  )
}
