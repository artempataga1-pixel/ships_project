"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";

const PHOTOS = [
  { src: "/images/brothers.jpg", alt: "Братья Разумовские" },
  { src: "/images/konstantin.jpg", alt: "Константин Разумовский" },
  { src: "/images/oleg.jpg", alt: "Олег Разумовский" },
];

// Дублируем массив для бесконечной прокрутки без рывков
const TRACK = [...PHOTOS, ...PHOTOS];

export function HeroSlider() {
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 700], ["0%", "30%"]);

  return (
    <motion.div
      className="absolute inset-0 will-change-transform overflow-hidden"
      style={{ y: imgY }}
    >
      <div className="slider-track">
        {TRACK.map((photo, idx) => (
          <div key={idx} className="slider-item">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority={idx < 2}
              className="object-cover object-top"
              sizes="50vw"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
