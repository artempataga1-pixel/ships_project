"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Заявка принята"
    >
      <div
        className="relative bg-background rounded-xl p-10 max-w-md w-full border border-gold/30 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>

        <div className="w-16 h-16 rounded-full bg-[rgba(228,199,83,0.15)] flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="font-display text-2xl font-semibold mb-3">Заявка принята</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Мы свяжемся с вами в течение рабочего дня. Все переговоры конфиденциальны.
        </p>

        <button
          onClick={onClose}
          className="mt-8 w-full py-3 bg-gold text-gold-foreground font-semibold rounded-lg hover:bg-gold-dark transition-colors"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
