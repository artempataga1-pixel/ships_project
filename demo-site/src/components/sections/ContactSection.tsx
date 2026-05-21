"use client";
import { useActionState, useEffect, useState } from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { YandexMap } from "@/components/ui/YandexMap";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { CONTACTS, PARTNERS } from "@/lib/constants";
import { submitContact, type ContactFormState } from "@/app/actions/contact";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "+7";
  const d = digits.startsWith("7") ? digits : "7" + digits;
  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length > 4) result += ") " + d.slice(4, 7);
  if (d.length > 7) result += "-" + d.slice(7, 9);
  if (d.length > 9) result += "-" + d.slice(9, 11);
  return result;
}

export function ContactSection() {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    submitContact,
    null
  );
  const [selectedPartner, setSelectedPartner] = useState<string>(PARTNERS[0].id);
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("+7");

  useEffect(() => {
    if (state?.success) {
      setShowModal(true);
    }
  }, [state]);

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;

  return (
    <>
      <SectionWrapper id="contact">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--dark-text-100)" }}>Контакты</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
            Записаться на консультацию
          </h2>
          <GoldDivider className="max-w-xs mx-auto" />
          <p className="mt-6 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Первичная консультация — конфиденциально. Мы свяжемся в течение рабочего дня.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Форма */}
          <form action={formAction} className="flex flex-col gap-5">
            {/* Скрытое поле партнёра */}
            <input type="hidden" name="partner" value={selectedPartner} />

            {/* Выбор партнёра */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Выберите партнёра
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PARTNERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPartner(p.id)}
                    className="flex items-center gap-3 px-4 py-3 border rounded-lg text-left transition-all duration-200"
                    style={{
                      background: "var(--card-bg)",
                      borderColor: selectedPartner === p.id ? "var(--gold)" : undefined,
                    }}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        selectedPartner === p.id ? "bg-gold" : "bg-border"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium leading-tight">{p.name.split(" ")[0]}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{p.role}</p>
                    </div>
                  </button>
                ))}
              </div>
              {state?.errors?.partner && (
                <p className="mt-1 text-xs text-red-500">{state.errors.partner[0]}</p>
              )}
            </div>

            {/* Имя */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
              >
                Ваше имя *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Иван Иванов"
                className="w-full px-4 py-3.5 border border-border rounded-lg text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/50 text-base sm:text-sm" style={{ background: "var(--card-bg)" }}
              />
              {state?.errors?.name && (
                <p className="mt-1 text-xs text-red-500">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Телефон */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
              >
                Телефон *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7 (___) ___-__-__"
                className="w-full px-4 py-3.5 border border-border rounded-lg text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/50 text-base sm:text-sm" style={{ background: "var(--card-bg)" }}
              />
              {state?.errors?.phone && (
                <p className="mt-1 text-xs text-red-500">{state.errors.phone[0]}</p>
              )}
            </div>

            {/* Сообщение */}
            <div>
              <label
                htmlFor="message"
                className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
              >
                Краткое описание ситуации
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Опишите вашу задачу..."
                className="w-full px-4 py-3.5 border border-border rounded-lg text-sm focus:outline-none focus:border-gold transition-colors resize-none placeholder:text-muted-foreground/50" style={{ background: "var(--card-bg)" }}
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-4 bg-gold text-gold-foreground font-semibold rounded-lg text-sm hover:bg-gold-dark transition-colors shadow-[0_4px_20px_rgba(228,199,83,0.3)] hover:shadow-[0_4px_30px_rgba(228,199,83,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "Отправляем..." : "Отправить заявку"}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Нажимая кнопку, вы соглашаетесь на обработку персональных данных
            </p>
          </form>

          {/* Контакты + карта */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Адрес</p>
                <p className="font-medium">{CONTACTS.address}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Телефон</p>
                <a
                  href={`tel:${CONTACTS.phone.replace(/\D/g, "")}`}
                  className="font-medium hover:text-gold transition-colors"
                >
                  {CONTACTS.phone}
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                <a
                  href={`mailto:${CONTACTS.email}`}
                  className="font-medium hover:text-gold transition-colors"
                >
                  {CONTACTS.email}
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Время работы
                </p>
                <p className="font-medium">{CONTACTS.workingHours}</p>
              </div>
            </div>

            <YandexMap apiKey={apiKey} />
          </div>
        </div>
      </SectionWrapper>

      <SuccessModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
