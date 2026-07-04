'use client'

import { useState, useRef, useEffect } from 'react'
import { PRACTICE_OPTIONS } from '@/constants/content/contacts'

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  id,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  id: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white/[0.04] border border-[var(--color-card-border)]/40 rounded px-4 py-3 text-left transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent-cold)]/50"
      >
        <span className={value ? 'text-white' : 'text-white/25'}>
          {value || placeholder}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`text-white/40 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 w-full mt-1 bg-[#1e1c1c] border border-[var(--color-card-border)]/40 rounded overflow-hidden">
          <li>
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-left px-4 py-3 text-white/30 text-sm hover:bg-white/[0.06] transition-colors duration-150"
            >
              {placeholder}
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 hover:bg-white/[0.06] hover:text-[var(--color-accent-cold)] ${
                  value === opt ? 'text-[var(--color-accent-cold)]' : 'text-white/80'
                }`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const formatPhone = (v: string): string => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (!d) return '+7'
  const n = d.startsWith('7') ? d : '7' + d
  let r = '+7'
  if (n.length > 1) r += ' (' + n.slice(1, 4)
  if (n.length > 4) r += ') ' + n.slice(4, 7)
  if (n.length > 7) r += '-' + n.slice(7, 9)
  if (n.length > 9) r += '-' + n.slice(9, 11)
  return r
}

const inputClass =
  'bg-white/[0.04] border rounded px-4 py-3 text-white placeholder:text-white/25 focus:outline-none transition-colors duration-200'
const labelClass = 'text-xs text-white/45 uppercase tracking-wider'

export function ContactForm() {
  const [phone, setPhone] = useState('+7')
  const [practice, setPractice] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [nameError, setNameError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const thankRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (submitted) {
      thankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [submitted])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
    if (phoneError) setPhoneError('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const nameVal = (form.elements.namedItem('name') as HTMLInputElement).value.trim()
    const digits = phone.replace(/\D/g, '')

    let hasError = false
    if (!nameVal) {
      setNameError('Введите ваше имя')
      hasError = true
    } else {
      setNameError('')
    }
    if (digits.length < 11) {
      setPhoneError('Введите корректный номер (+7 XXX XXX-XX-XX)')
      hasError = true
    } else {
      setPhoneError('')
    }
    if (hasError) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div ref={thankRef} className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full border border-[var(--color-accent-cold)]/50 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-[var(--color-accent-cold)]"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-heading text-2xl font-extrabold">Спасибо!</h3>
        <p className="text-white/55">Свяжемся с вами в течение рабочего дня</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Имя */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>
          Ваше имя *
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Иван Иванов"
          className={`${inputClass} ${
            nameError
              ? 'border-red-400/60 focus:border-red-400/80'
              : 'border-[var(--color-card-border)]/40 focus:border-[var(--color-accent-cold)]/50'
          }`}
        />
        {nameError && (
          <p role="alert" className="text-xs text-red-400/80">
            {nameError}
          </p>
        )}
      </div>

      {/* Телефон */}
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className={labelClass}>
          Телефон *
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          required
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+7 (XXX) XXX-XX-XX"
          className={`${inputClass} ${
            phoneError
              ? 'border-red-400/60 focus:border-red-400/80'
              : 'border-[var(--color-card-border)]/40 focus:border-[var(--color-accent-cold)]/50'
          }`}
        />
        {phoneError && (
          <p role="alert" className="text-xs text-red-400/80">
            {phoneError}
          </p>
        )}
      </div>

      {/* Направление */}
      <div className="flex flex-col gap-2">
        <label htmlFor="practice" className={labelClass}>
          Направление
        </label>
        <CustomSelect
          id="practice"
          value={practice}
          onChange={setPractice}
          options={PRACTICE_OPTIONS}
          placeholder="— Выберите практику —"
        />
      </div>

      {/* Сообщение */}
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={labelClass}>
          Сообщение
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Опишите вашу ситуацию..."
          className={`${inputClass} border-[var(--color-card-border)]/40 focus:border-[var(--color-accent-cold)]/50 resize-none`}
        />
      </div>

      <button
        type="submit"
        className="self-start px-10 py-4 text-sm uppercase tracking-widest border border-[var(--color-accent-cold)]/50 text-[var(--color-accent-cold)] hover:bg-[var(--color-accent-cold)]/10 transition-colors duration-300"
      >
        Отправить заявку
      </button>
    </form>
  )
}
