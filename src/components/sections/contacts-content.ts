import { CONTACT_INFO } from '@/constants/content/contacts'

export interface ContactDetailLink {
  label: string
  href: string
}

export interface ContactDetailItem {
  type: 'phone' | 'email' | 'address'
  /* Ссылки строки (два телефона — две ссылки); у адреса ссылок нет */
  links?: ContactDetailLink[]
  /* Текст без ссылки — адрес */
  title?: string
  text?: string
  /* Дополнительная ссылка мелким шрифтом под строкой («Построить маршрут») */
  extraLink?: ContactDetailLink
}

const telHref = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`

const PHONES = [CONTACT_INFO.phone, CONTACT_INFO.phoneSecondary].filter(
  (phone): phone is string => Boolean(phone),
)

/* Маршрут — поиск адреса в Яндекс Картах: там одна кнопка до маршрута.
   Ссылку на карточку самого офиса в Яндекс Бизнесе или 2ГИС заказчик пока не
   передавал; когда передаст — подставить её сюда. */
const ROUTE_HREF = `https://yandex.ru/maps/?text=${encodeURIComponent(
  'Новосибирск, улица Депутатская, 2',
)}`

/* Редактируемый текст блока «Контакты». Телефоны/почта/адрес — из
   канонического CONTACT_INFO (src/constants/content/contacts.ts), синхронно
   с футером. Telegram-канала заказчик пока не утвердил, поэтому ссылки на
   него нет ни здесь, ни в футере.

   Аудит 05.11.2026: убрана фраза «Ответим в течение рабочего дня», к часам
   добавлено «по времени Новосибирска», к адресу — «Построить маршрут». */
export const contactsContent = {
  eyebrow: 'КОНТАКТЫ',
  titleLine1: 'Обсудим вашу задачу',
  titleLine2: 'и найдём решение',
  subtitleLine1: 'Оставьте заявку — мы свяжемся с вами',
  subtitleLine2: 'и предложим оптимальный путь',
  submitLabel: 'ОТПРАВИТЬ ЗАЯВКУ',
  consentLabel: 'Согласен(на) на обработку персональных данных',
  messagePlaceholder: 'Кратко опишите вопрос. Порядок передачи документов согласуем после первого контакта',
  invalidText: 'Заявка не отправлена: заполните отмеченные поля.',
  fieldErrors: {
    name: 'Укажите имя',
    phone: 'Номер из 11 цифр',
    message: 'Опишите вопрос',
    consent: 'Нужно согласие на обработку данных',
  },
  successText: 'Спасибо! Заявка принята. Мы скоро свяжемся с вами.',
  errorText: `Заявка не отправлена. Введённый текст сохранён — попробуйте ещё раз или позвоните нам: ${PHONES.join(', ')}.`,
  details: [
    {
      type: 'phone',
      links: PHONES.map((phone) => ({ label: phone, href: telHref(phone) })),
      text: 'Пн–Пт: 9:00 – 18:00 по времени Новосибирска',
    },
    {
      type: 'email',
      links: [{ label: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` }],
    },
    {
      type: 'address',
      title: CONTACT_INFO.address,
      extraLink: { label: 'Построить маршрут', href: ROUTE_HREF },
    },
  ] satisfies ContactDetailItem[] as ContactDetailItem[],
}
