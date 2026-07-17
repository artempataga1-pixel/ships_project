'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CONTACT_INFO, PRACTICE_OPTIONS } from '@/constants/content/contacts'

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
        className="flex w-full items-center justify-between rounded-sm border border-[var(--color-lime-ink)]/35 bg-white px-4 py-3.5 text-left transition-colors duration-200 focus:border-[var(--color-lime-ink)] focus:outline-none lg:py-[min(0.97vh,0.875rem)]"
      >
        <span className={value ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}>
          {value || placeholder}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-sm border border-[var(--color-line)] bg-white shadow-[0_20px_50px_rgba(0,0,0,.10)]">
          <li>
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full px-4 py-3 text-left text-sm text-[var(--color-muted)] transition-colors duration-150 hover:bg-[var(--color-surface-soft)]"
            >
              {placeholder}
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-lime-ink)] ${
                  value === opt ? 'text-[var(--color-lime-ink)]' : 'text-[var(--color-text)]'
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
  'rounded-sm border bg-white px-4 py-3.5 text-[var(--color-text)] font-medium placeholder:text-[var(--color-muted)] focus:outline-none transition-colors duration-200 lg:py-[min(0.97vh,0.875rem)]'
const labelClass = 'text-xs font-extrabold uppercase tracking-[0.03em] text-[var(--color-text)]/75'

export function ContactForm() {
  const [phone, setPhone] = useState('+7')
  const [practice, setPractice] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [nameError, setNameError] = useState('')
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const nameVal = (form.elements.namedItem('name') as HTMLInputElement).value.trim()
    const messageVal = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim()
    const honeypotVal = (form.elements.namedItem('website') as HTMLInputElement).value
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
    if (!consent) {
      setConsentError('Необходимо согласие на обработку персональных данных')
      hasError = true
    } else {
      setConsentError('')
    }
    if (hasError) return

    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameVal,
          phone: digits,
          practice,
          message: messageVal,
          website: honeypotVal,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('idle')
      setSubmitted(true)
    } catch {
      setStatus('error')
    }
  }

  if (submitted) {
    return (
      <div ref={thankRef} className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-[var(--color-lime-ink)]"
          style={{ background: 'rgba(201,255,31,.18)' }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-heading text-2xl font-extrabold text-[var(--color-text)]">Ваша заявка оформлена!</h3>
        <p className="text-[var(--color-muted)]">Свяжемся с вами в течение рабочего дня</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 lg:gap-[min(1.67vh,1.5rem)]">
      {/* Ловушка для спам-ботов: люди поле не видят и не заполняют */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Имя */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>
          Ваше имя *
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Ваше имя"
          className={`${inputClass} ${
            nameError
              ? 'border-red-400/70 focus:border-red-500'
              : 'border-[var(--color-lime-ink)]/35 focus:border-[var(--color-lime-ink)]'
          }`}
        />
        {nameError && (
          <p role="alert" className="text-xs text-red-500">
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
          placeholder="+7 (___) ___-__-__"
          className={`${inputClass} ${
            phoneError
              ? 'border-red-400/70 focus:border-red-500'
              : 'border-[var(--color-lime-ink)]/35 focus:border-[var(--color-lime-ink)]'
          }`}
        />
        {phoneError && (
          <p role="alert" className="text-xs text-red-500">
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
          rows={4}
          maxLength={2000}
          placeholder="Опишите вашу ситуацию..."
          className={`${inputClass} resize-none border-[var(--color-lime-ink)]/35 focus:border-[var(--color-lime-ink)] lg:h-[clamp(4.5rem,8.75vh,126px)]`}
        />
      </div>

      {/* Согласие на обработку персональных данных (152-ФЗ) */}
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked)
              if (e.target.checked) setConsentError('')
            }}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-lime-ink)]"
          />
          <span className="text-xs text-[var(--color-muted)]">
            Согласен(на) на{' '}
            <Link
              href="/privacy-policy#consent"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--color-lime-ink)] transition-colors duration-200"
            >
              обработку персональных данных
            </Link>{' '}
            *
          </span>
        </label>
        {consentError && (
          <p role="alert" className="text-xs text-red-500">
            {consentError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-lime-fill mt-1 h-14 w-full rounded-sm text-sm font-extrabold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[280px] lg:h-[clamp(2.75rem,3.89vh,3.5rem)]"
      >
        {status === 'sending' ? 'Отправка…' : 'Отправить заявку'}
      </button>

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-500">
          Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам: {CONTACT_INFO.phone}
        </p>
      )}
    </form>
  )
}
