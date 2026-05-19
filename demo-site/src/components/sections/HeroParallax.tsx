"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";
import { HERO } from "@/lib/constants";

export function HeroParallax() {
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 700], ["0%", "30%"]);

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{ y: imgY }}
    >
      <Image
        src={HERO.photo}
        alt="Братья Разумовские"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
    </motion.div>
  );
}
