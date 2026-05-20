import Image from "next/image";
import { CONTACTS } from "@/lib/constants";

const NAV_LINKS = [
  { label: "Практика", href: "#services" },
  { label: "Кейсы", href: "#cases" },
  { label: "Команда", href: "#partners" },
  { label: "Принципы", href: "#principles" },
  { label: "Новости", href: "#news" },
  { label: "Контакты", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-white/70 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Логотип"
                width={40}
                height={40}
                className="object-contain mix-blend-screen opacity-90"
              />
              <span className="font-display text-sm font-semibold text-white">
                Разумовские и Партнёры
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Премиальная юридическая компания.
              <br />
              Защита бизнеса на уровне высших инстанций.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Навигация
            </h3>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Контакты
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>{CONTACTS.address}</li>
              <li>
                <a
                  href={`tel:${CONTACTS.phone.replace(/\D/g, "")}`}
                  className="hover:text-gold transition-colors"
                >
                  {CONTACTS.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACTS.email}`}
                  className="hover:text-gold transition-colors"
                >
                  {CONTACTS.email}
                </a>
              </li>
              <li className="text-white/40 text-xs mt-1">{CONTACTS.workingHours}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>
            © {new Date().getFullYear()} Братья Разумовские и Партнёры. Все права защищены.
          </p>
          <p>Информация на сайте носит ознакомительный характер и не является офертой.</p>
        </div>
      </div>
    </footer>
  );
}
