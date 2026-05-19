"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PartnerAvatar } from "@/components/ui/PartnerAvatar";
import { PARTNERS } from "@/lib/constants";

export function PartnersTabs() {
  const [active, setActive] = useState<number>(0);
  const partner = PARTNERS[active];

  return (
    <>
      <div className="flex justify-center gap-8 mb-12">
        {PARTNERS.map((p, idx) => (
          <div key={p.id} className="flex flex-col items-center gap-3">
            <PartnerAvatar
              partner={p}
              isActive={active === idx}
              onClick={() => setActive(idx)}
              size={80}
            />
            <span
              className={`text-xs uppercase tracking-wider transition-colors ${
                active === idx ? "text-gold" : "text-white/40"
              }`}
            >
              {p.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={partner.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start"
        >
          <div className="lg:col-span-2 flex justify-center">
            <div className="relative w-72 h-96 rounded-lg overflow-hidden border border-white/10 shrink-0">
              <Image
                src={partner.photo}
                alt={partner.name}
                fill
                className="object-cover object-top"
                sizes="300px"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-white font-semibold">{partner.name}</p>
                <p className="text-gold text-xs mt-0.5">{partner.role}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-7">
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-2">Специализация</p>
              <p className="text-white text-lg font-display leading-snug">{partner.specialty}</p>
            </div>
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-2">О партнёре</p>
              <p className="text-white/70 leading-relaxed text-sm">{partner.bio}</p>
            </div>
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-3">Ключевые достижения</p>
              <ul className="flex flex-col gap-2">
                {partner.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-3">Образование</p>
              <ul className="flex flex-col gap-2">
                {partner.education.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
