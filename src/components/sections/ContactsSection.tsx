'use client'

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  Briefcase,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  UserRound,
} from 'lucide-react'

import { MEDIA_MENTIONS, PRACTICE_OPTIONS } from '@/constants/content/contacts'
import './contacts-section.css'
import { contactsContent } from './contacts-content'

/* Логотипы изданий для «Нам доверяют» — берём только реальные файлы
   из MEDIA_MENTIONS (Право.ru идёт текстом, без файла — сюда не подходит).
   Континент Сибирь и Российская газета исключены по просьбе — оставшиеся
   логотипы крупнее и заметнее в один ряд. Рендерим как mask-image в
   акцентном цвете — так все логотипы выглядят единым лаймовым силуэтом. */
const EXCLUDED_TRUST_LOGOS = new Set(['Континент Сибирь', 'Российская газета'])
const trustLogos = MEDIA_MENTIONS.filter(
  (m): m is typeof m & { logo: string } => Boolean(m.logo) && !EXCLUDED_TRUST_LOGOS.has(m.name),
)

const detailIcons = {
  phone: Phone,
  email: Mail,
  address: MapPin,
} satisfies Record<string, typeof Phone>

/* Маска телефона: цифры нормализуются в +7, остальное отбрасывается —
   та же логика, что была в прежнем виджете контактов. */
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

type FieldErrors = {
  name?: boolean
  phone?: boolean
  message?: boolean
  consent?: boolean
}

/* Секция «Контакты» — блок из contact-section-package, перенесённый в React.
   Фон (люди, интерьер, стеклянная панель, подиум) — public/contact-assets/
   contact-background.png, заголовки/форма/иконки/панели — кодом. Заявка уходит
   в тот же /api/contact (Telegram-уведомления), что и раньше. */
export function ContactsSection() {
  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)

  const [phone, setPhone] = useState('+7')
  const [practice, setPractice] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  function clearFieldError(field: keyof FieldErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev))
    if (statusMessage) setStatusMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return

    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const website = String(data.get('website') ?? '')
    const digits = phone.replace(/\D/g, '')

    const nextErrors: FieldErrors = {
      name: !name,
      phone: digits.length !== 11,
      message: !message,
      consent: !consent,
    }
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      setStatus('error')
      setStatusMessage(contactsContent.invalidText)
      if (nextErrors.name) nameRef.current?.focus()
      else if (nextErrors.phone) phoneRef.current?.focus()
      else if (nextErrors.message) messageRef.current?.focus()
      else if (nextErrors.consent) consentRef.current?.focus()
      return
    }

    setStatus('sending')
    setStatusMessage('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: digits, practice, message, website }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      form.reset()
      setPhone('+7')
      setPractice('')
      setConsent(false)
      setErrors({})
      setStatus('success')
      setStatusMessage(contactsContent.successText)
    } catch {
      setStatus('error')
      setStatusMessage(`${contactsContent.errorText} ${contactsContent.details[0].title}`)
    }
  }

  return (
    <section className="pb-contact" id="contacts" aria-labelledby="pb-contact-title">
      <div className="pb-contact__stage">
        {/* Отдельный id для якорной посадки: у секции сверху фото-баннер
            (мобильный pb-contact__stage padding-top), и переход по «/#contacts»
            должен долистывать ДО заголовка, а не до фото. См. HomeAnchorScroll. */}
        <header className="pb-contact__intro scroll-mt-16" id="contacts-anchor">
          <p className="pb-contact__eyebrow">{contactsContent.eyebrow}</p>
          <h2 className="pb-contact__title" id="pb-contact-title">
            {contactsContent.titleLine1}
            <br />
            {contactsContent.titleLine2}
          </h2>
          <p className="pb-contact__lead">
            {contactsContent.subtitleLine1}
            <br />
            {contactsContent.subtitleLine2}
          </p>
        </header>

        <form ref={formRef} className="pb-contact__form" onSubmit={handleSubmit} noValidate>
          <div className="pb-contact__field">
            <UserRound aria-hidden="true" />
            <label className="pb-contact__sr-only" htmlFor="pb-name">
              Ваше имя
            </label>
            <input
              ref={nameRef}
              id="pb-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Ваше имя"
              required
              aria-invalid={errors.name ? 'true' : undefined}
              onChange={() => clearFieldError('name')}
            />
          </div>

          <div className="pb-contact__field">
            <Phone aria-hidden="true" />
            <label className="pb-contact__sr-only" htmlFor="pb-phone">
              Телефон
            </label>
            <input
              ref={phoneRef}
              id="pb-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Телефон"
              required
              value={phone}
              aria-invalid={errors.phone ? 'true' : undefined}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value))
                clearFieldError('phone')
              }}
            />
          </div>

          <div className="pb-contact__field pb-contact__field--select">
            <Briefcase aria-hidden="true" />
            <label className="pb-contact__sr-only" htmlFor="pb-practice">
              Направление
            </label>
            <select
              id="pb-practice"
              name="practice"
              value={practice}
              onChange={(e) => setPractice(e.target.value)}
              data-empty={practice === '' ? 'true' : undefined}
            >
              <option value="">Направление обращения</option>
              {PRACTICE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="pb-contact__field pb-contact__field--message">
            <MessageSquare aria-hidden="true" />
            <label className="pb-contact__sr-only" htmlFor="pb-message">
              Опишите вашу задачу
            </label>
            <textarea
              ref={messageRef}
              id="pb-message"
              name="message"
              rows={4}
              maxLength={2000}
              placeholder="Опишите вашу задачу"
              required
              aria-invalid={errors.message ? 'true' : undefined}
              onChange={() => clearFieldError('message')}
            />
          </div>

          {/* Антиспам-поле: посетитель его не видит. */}
          <label className="pb-contact__honey" aria-hidden="true">
            Не заполняйте это поле
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>

          <button className="pb-contact__submit" type="submit" disabled={status === 'sending'}>
            <span>{status === 'sending' ? 'ОТПРАВКА…' : contactsContent.submitLabel}</span>
            <ArrowRight aria-hidden="true" />
          </button>

          <label className="pb-contact__consent">
            <input
              ref={consentRef}
              type="checkbox"
              name="consent"
              checked={consent}
              aria-invalid={errors.consent ? 'true' : undefined}
              onChange={(e) => {
                setConsent(e.target.checked)
                clearFieldError('consent')
              }}
            />
            <span>
              {contactsContent.consentLabel}{' '}
              <a href="/privacy-policy#consent" target="_blank" rel="noopener noreferrer">
                (политика обработки ПДн)
              </a>
            </span>
          </label>

          <p className="pb-contact__status" role="status" aria-live="polite" data-state={status === 'error' ? 'error' : undefined}>
            {statusMessage}
          </p>
        </form>

        <address className="pb-contact__details" aria-label="Контактная информация">
          {contactsContent.details.map((item) => {
            const Icon = detailIcons[item.type]
            const inner = (
              <>
                <span className="pb-contact__detail-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span>
                  {item.href ? <a href={item.href}>{item.title}</a> : <strong>{item.title}</strong>}
                  {item.text && <small>{item.text}</small>}
                </span>
              </>
            )
            return (
              <div className="pb-contact__detail" key={item.type}>
                {inner}
              </div>
            )
          })}
        </address>

        <section className="pb-contact__trust" aria-labelledby="pb-trust-title">
          <h3 id="pb-trust-title">Нам доверяют</h3>
          <div className="pb-contact__trust-logos" aria-label="СМИ и рейтинги, писавшие о компании">
            {trustLogos.map((item) => (
              <span
                key={item.name}
                className="pb-contact__trust-logo"
                style={{ WebkitMaskImage: `url(${item.logo})`, maskImage: `url(${item.logo})` }}
                role="img"
                aria-label={item.name}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
