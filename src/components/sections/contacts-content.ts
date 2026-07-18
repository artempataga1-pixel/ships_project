import { CONTACT_INFO } from '@/constants/content/contacts'

export interface ContactDetailItem {
  type: 'phone' | 'email' | 'address'
  title: string
  text?: string
  href?: string
}

/* Редактируемый текст блока «Контакты». Телефон/почта/адрес — из
   канонического CONTACT_INFO (src/constants/content/contacts.ts), синхронно
   с футером. Telegram-ссылки в проекте нет (в футере — заглушка href="#"),
   поэтому в списке контактов её нет — добавить, когда появится реальная
   ссылка на канал/чат. */
export const contactsContent = {
  eyebrow: 'КОНТАКТЫ',
  titleLine1: 'Обсудим вашу задачу',
  titleLine2: 'и найдём решение',
  subtitleLine1: 'Оставьте заявку — мы свяжемся с вами',
  subtitleLine2: 'и предложим оптимальный путь',
  submitLabel: 'ОТПРАВИТЬ ЗАЯВКУ',
  consentLabel: 'Согласен(на) на обработку персональных данных',
  invalidText: 'Проверьте правильность заполнения полей.',
  successText: 'Спасибо! Заявка принята. Мы скоро свяжемся с вами.',
  errorText: 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам:',
  details: [
    {
      type: 'phone',
      title: CONTACT_INFO.phone,
      text: 'Пн–Пт: 9:00 – 18:00',
      href: `tel:+${CONTACT_INFO.phone.replace(/\D/g, '')}`,
    },
    {
      type: 'email',
      title: CONTACT_INFO.email,
      text: 'Ответим в течение рабочего дня',
      href: `mailto:${CONTACT_INFO.email}`,
    },
    {
      type: 'address',
      title: CONTACT_INFO.address,
    },
  ] satisfies ContactDetailItem[] as ContactDetailItem[],
}
