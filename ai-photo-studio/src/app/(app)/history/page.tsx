'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { HistoryCard, type HistoryItem } from '@/components/HistoryCard'

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history')
      if (!res.ok) throw new Error('Не удалось загрузить историю')
      const data: HistoryItem[] = await res.json()
      setItems(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка загрузки истории')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleRegenerate = useCallback(async (item: HistoryItem) => {
    setRegeneratingId(item.id)
    try {
      const fd = new FormData()
      fd.append('sourceImagePaths', JSON.stringify(item.sourceImagePaths))
      fd.append('style', item.style)
      if (item.prompt) fd.append('prompt', item.prompt)
      fd.append('aspectRatio', item.aspectRatio)

      const res = await fetch('/api/generate', { method: 'POST', body: fd })

      if (res.status === 403) {
        toast.error('Лимит 50 генераций исчерпан')
        return
      }

      if (res.status === 410) {
        toast.error('Исходные файлы недоступны. Создайте новую генерацию.')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `Ошибка сервера (${res.status})`)
      }

      toast.success('Генерация завершена! Список обновлён.')
      // Тихая перезагрузка без Skeleton
      const fresh = await fetch('/api/history')
      if (fresh.ok) setItems(await fresh.json())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка генерации')
    } finally {
      setRegeneratingId(null)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">История</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-5xl">🎨</p>
        <h1 className="text-xl font-semibold">История пуста</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Создай свою первую стилизацию — она появится здесь
        </p>
        <Link href="/" className="text-primary text-sm underline underline-offset-2">
          Создать стилизацию →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">История</h1>
        <span className="text-sm text-muted-foreground">{items.length} генераций</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            onRegenerate={handleRegenerate}
            isRegenerating={regeneratingId === item.id}
          />
        ))}
      </div>
    </div>
  )
}
