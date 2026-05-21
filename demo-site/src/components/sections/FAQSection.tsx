"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";

const FAQ_ITEMS = [
  {
    question: "Как понять, подходит ли моё дело для вашей фирмы?",
    answer:
      "Мы специализируемся на делах с высокой стоимостью активов — от 100 млн рублей. Запишитесь на первичную консультацию: партнёр лично оценит ситуацию и перспективы защиты.",
  },
  {
    question: "Вы работаете по гонорару успеха?",
    answer:
      "В ряде дел — да. Условия формируются индивидуально после первичного анализа обстоятельств и оценки реальных судебных перспектив.",
  },
  {
    question: "Сколько времени занимает арбитражный процесс?",
    answer:
      "В среднем от шести до восемнадцати месяцев, в зависимости от инстанций и сложности дела. Стратегию мы строим с учётом реальных сроков — без ложных обещаний.",
  },
  {
    question: "Как обеспечивается конфиденциальность моего дела?",
    answer:
      "Все сведения защищены адвокатской тайной. Мы не раскрываем имена клиентов и детали процессов третьим лицам ни при каких обстоятельствах.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionWrapper id="faq">
      <div className="text-center mb-14">
        <p
          className="text-xs uppercase tracking-[0.2em] mb-4"
          style={{ color: "var(--dark-text-100)" }}
        >
          Часто спрашивают
        </p>
        <h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5"
          style={{ color: "var(--dark-text-100)" }}
        >
          Ответы на вопросы
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-lg overflow-hidden"
              style={{
                background: "var(--card-bg)",
                border: `1px solid ${isOpen ? "var(--faq-card-active-border)" : "var(--faq-card-border)"}`,
                boxShadow: isOpen ? "var(--faq-card-active-shadow)" : "var(--faq-card-shadow)",
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex justify-between items-center px-6 py-4 text-left"
              >
                <span
                  className="font-medium text-sm"
                  style={{ color: "var(--dark-text-100)" }}
                >
                  {item.question}
                </span>
                <ChevronDown
                  size={18}
                  className="shrink-0 ml-4"
                  style={{
                    color: "var(--card-accent)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <p
                  className="px-6 pb-4 pt-1 text-sm leading-relaxed"
                  style={{ color: "var(--dark-text-70)" }}
                >
                  {item.answer}
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
