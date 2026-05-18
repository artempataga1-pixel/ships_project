'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Upload, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, MAX_FILES } from '@/lib/upload'

interface DropZoneProps {
  files: File[]
  onChange: (files: File[]) => void
  className?: string
  disabled?: boolean
}

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `${file.name}: разрешены только JPG и PNG`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: файл превышает 10MB`
  }
  return null
}

export function DropZone({ files, onChange, className, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  const addFiles = useCallback(
    (incoming: File[]) => {
      const errs: string[] = []
      const valid: File[] = []

      for (const file of incoming) {
        const err = validateFile(file)
        if (err) {
          errs.push(err)
        } else {
          valid.push(file)
        }
      }

      setErrors(errs)

      if (valid.length > 0) {
        const combined = [...files, ...valid]
        if (combined.length > MAX_FILES) {
          errs.push(`Максимум ${MAX_FILES} файлов — лишние проигнорированы`)
          setErrors([...errs])
        }
        onChange(combined.slice(0, MAX_FILES))
      }
    },
    [files, onChange]
  )

  const removeFile = (index: number) => {
    setErrors([])
    onChange(files.filter((_, i) => i !== index))
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      addFiles(Array.from(e.dataTransfer.files))
    },
    [addFiles]
  )

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
    e.target.value = ''
  }

  const isFull = files.length >= MAX_FILES

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDrop={disabled ? undefined : onDrop}
        onDragOver={disabled ? undefined : onDragOver}
        onDragLeave={disabled ? undefined : onDragLeave}
        className={cn(
          'relative flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors',
          !isFull && !disabled && 'cursor-pointer',
          disabled && 'pointer-events-none opacity-50',
          isDragOver
            ? 'border-primary bg-primary/5'
            : isFull
              ? 'border-border opacity-50'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
        )}
        onClick={() => !isFull && !disabled && inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragOver ? 'Отпусти файлы здесь' : isFull ? 'Максимум файлов загружено' : 'Перетащи фото сюда'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG · до 10MB · {files.length}/{MAX_FILES} файлов
          </p>
        </div>
        {!isFull && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Выбрать из галереи
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={onInputChange}
      />

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive">
              {err}
            </p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="group relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previews[i] ?? ''}
                alt={file.name}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                aria-label={`Удалить ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
