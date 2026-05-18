'use client'

import { RefreshCw, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STYLE_NAMES: Record<string, string> = {
  'ghibli': 'Studio Ghibli',
  'watercolor': 'Акварель',
  'oil-painting': 'Масло',
  'vintage': 'Ретро',
  'anime': 'Аниме',
  'cyberpunk': 'Киберпанк',
  'sketch': 'Карандаш',
  'golden-hour': 'Золотой час',
  'cinematic-bw': 'Нуар',
  'fairy-tale': 'Сказка',
}

export interface HistoryItem {
  id: string
  status: string
  style: string
  prompt: string | null
  aspectRatio: string
  sourceImagePaths: string[]
  sourceImageUrls: string[]
  resultImageUrl: string | null
  createdAt: string | null
  completedAt: string | null
}

interface HistoryCardProps {
  item: HistoryItem
  onRegenerate: (item: HistoryItem) => void
  isRegenerating?: boolean
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HistoryCard({ item, onRegenerate, isRegenerating }: HistoryCardProps) {
  const canRegenerate = item.sourceImagePaths.length > 0 && !isRegenerating

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col gap-3 p-3 overflow-hidden">
      {/* Заголовок: стиль + дата */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">
          {STYLE_NAMES[item.style] ?? item.style}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDate(item.createdAt)}
        </span>
      </div>

      {/* Изображения: исходники → результат */}
      <div className="flex items-center gap-2">
        {/* Исходные фото */}
        <div className="flex gap-1">
          {item.sourceImageUrls.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
          {item.sourceImageUrls.length > 3 && (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
              +{item.sourceImageUrls.length - 3}
            </div>
          )}
        </div>

        <span className="text-muted-foreground text-sm shrink-0">→</span>

        {/* Результат */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
          {item.status === 'completed' && item.resultImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.resultImageUrl}
              alt="Результат"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : item.status === 'failed' ? (
            <AlertCircle className="w-5 h-5 text-destructive" />
          ) : (
            <Clock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Футер: промпт + кнопка */}
      <div className="flex items-end justify-between gap-2">
        {item.prompt ? (
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1 min-w-0">
            {item.prompt}
          </p>
        ) : (
          <div className="flex-1" />
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={!canRegenerate}
          onClick={() => onRegenerate(item)}
          className={cn('shrink-0', isRegenerating && 'cursor-wait')}
        >
          <RefreshCw className={cn('w-3 h-3 mr-1.5', isRegenerating && 'animate-spin')} />
          Повторить
        </Button>
      </div>
    </div>
  )
}
