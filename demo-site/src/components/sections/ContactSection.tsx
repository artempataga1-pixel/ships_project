"use client";
import { useState } from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { YandexMap } from "@/components/ui/YandexMap";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { CONTACTS, PARTNERS } from "@/lib/constants";

type FormState = {
  name: string;
  phone: string;
  message: string;
  partner: string;
};

export function ContactSection() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    message: "",
    partner: PARTNERS[0].id,
  });
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
    setForm({ name: "", phone: "", message: "", partner: PARTNERS[0].id });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;

  return (
    <>
      <SectionWrapper id="contact">
        <div className="text-center mb-14">
          <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">Контакты</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-5">
            Записаться на консультацию
          </h2>
          <GoldDivider className="max-w-xs mx-auto" />
          <p className="mt-6 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Первичная консультация — конфиденциально. Мы свяжемся в течение рабочего дня.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Форма */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Выбор партнёра */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Выберите партнёра
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PARTNERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, partner: p.id }))}
                    className={`flex items-center gap-3 px-4 py-3 border rounded-lg text-left transition-all duration-200 ${
                      form.partner === p.id
                        ? "border-gold bg-[rgba(228,199,83,0.05)] text-foreground"
                        : "border-border hover:border-gold/40 text-muted-foreground"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${form.partner === p.id ? "bg-gold" : "bg-border"}`} />
                    <div>
                      <p className="text-sm font-medium leading-tight">{p.name.split(" ")[0]}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{p.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Имя */}
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Ваше имя *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Иван Иванов"
                className="w-full px-4 py-3.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Телефон */}
            <div>
              <label htmlFor="phone" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Телефон *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+7 (___) ___-__-__"
                className="w-full px-4 py-3.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Сообщение */}
            <div>
              <label htmlFor="message" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Краткое описание ситуации
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="Опишите вашу задачу..."
                className="w-full px-4 py-3.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-gold transition-colors resize-none placeholder:text-muted-foreground/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gold text-gold-foreground font-semibold rounded-lg text-sm hover:bg-gold-dark transition-colors shadow-[0_4px_20px_rgba(228,199,83,0.3)] hover:shadow-[0_4px_30px_rgba(228,199,83,0.45)]"
            >
              Отправить заявку
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
                <a href={`tel:${CONTACTS.phone.replace(/\D/g, "")}`} className="font-medium hover:text-gold transition-colors">
                  {CONTACTS.phone}
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                <a href={`mailto:${CONTACTS.email}`} className="font-medium hover:text-gold transition-colors">
                  {CONTACTS.email}
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Время работы</p>
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
