'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DropZone } from '@/components/DropZone'
import { StyleGrid } from '@/components/StyleGrid'
import { GenerationResult } from '@/components/GenerationResult'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AspectRatio = '1:1' | '9:16' | '16:9'

interface GenerationResponse {
  generationId: string
  resultUrl: string
}

interface ResultState {
  generationId: string
  resultUrl: string
  files: File[]
  style: string
  prompt: string
  aspectRatio: AspectRatio
}

export default function GeneratorPage() {
  const [files, setFiles] = useState<File[]>([])
  const [style, setStyle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  const generate = async (
    genFiles: File[],
    genStyle: string,
    genPrompt: string,
    genAspectRatio: AspectRatio
  ) => {
    setLoading(true)

    try {
      const fd = new FormData()
      genFiles.forEach((f) => fd.append('files', f))
      fd.append('style', genStyle)
      if (genPrompt.trim()) fd.append('prompt', genPrompt.trim())
      fd.append('aspectRatio', genAspectRatio)

      const res = await fetch('/api/generate', { method: 'POST', body: fd })

      if (res.status === 403) {
        setLimitReached(true)
        toast.error('Лимит 50 генераций исчерпан')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `Ошибка сервера (${res.status})`)
      }

      const data: GenerationResponse = await res.json()
      setResult({
        generationId: data.generationId,
        resultUrl: data.resultUrl,
        files: genFiles,
        style: genStyle,
        prompt: genPrompt,
        aspectRatio: genAspectRatio,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка генерации')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      toast.error('Загрузите хотя бы одно фото')
      return
    }
    if (!style) {
      toast.error('Выберите стиль')
      return
    }
    generate(files, style, prompt, aspectRatio)
  }

  const handleReset = () => {
    setResult(null)
    setFiles([])
    setStyle('')
    setPrompt('')
    setAspectRatio('1:1')
  }

  const handleRegenerate = () => {
    if (!result) return
    generate(result.files, result.style, result.prompt, result.aspectRatio)
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg py-4">
        <GenerationResult
          resultUrl={result.resultUrl}
          onReset={handleReset}
          onRegenerate={handleRegenerate}
          loading={loading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Стилизация фото</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Загрузи до 5 фото и выбери стиль
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-sm font-medium">Фотографии</h2>
          <DropZone files={files} onChange={setFiles} disabled={loading} />
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium">Стиль</h2>
          <StyleGrid value={style} onChange={setStyle} disabled={loading} />
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium">Соотношение сторон</h2>
          <div className="flex gap-2">
            {(['1:1', '9:16', '16:9'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                disabled={loading}
                onClick={() => setAspectRatio(ratio)}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                  'disabled:pointer-events-none disabled:opacity-50',
                  aspectRatio === ratio
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                {ratio}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium">
            Дополнительные детали{' '}
            <span className="font-normal text-muted-foreground">(необязательно)</span>
          </h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={500}
            disabled={loading}
            placeholder="Например: добавь больше синего цвета, сделай зимний пейзаж..."
            className={cn(
              'w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-1 focus:ring-ring',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
            rows={3}
          />
        </section>

        {loading && (
          <div className="overflow-hidden rounded-full bg-muted h-1">
            <div className="h-full w-1/2 rounded-full bg-primary animate-[indeterminate_1.5s_ease-in-out_infinite]" />
          </div>
        )}

        {limitReached ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
            Лимит 50 генераций исчерпан. Свободный план не поддерживает больше.
          </div>
        ) : (
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Генерирую...' : 'Сгенерировать'}
          </Button>
        )}
      </form>
    </div>
  )
}
