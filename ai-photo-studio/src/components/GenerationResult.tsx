'use client'

import { RefreshCw, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GenerationResultProps {
  resultUrl: string
  onReset: () => void
  onRegenerate: () => void
  loading: boolean
}

export function GenerationResult({ resultUrl, onReset, onRegenerate, loading }: GenerationResultProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resultUrl}
          alt="Результат стилизации"
          className="w-full object-contain"
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={loading}
          className="flex-1"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Начать заново
        </Button>
        <Button
          type="button"
          onClick={onRegenerate}
          disabled={loading}
          className="flex-1"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Генерирую...' : 'Повторить'}
        </Button>
      </div>
    </div>
  )
}
