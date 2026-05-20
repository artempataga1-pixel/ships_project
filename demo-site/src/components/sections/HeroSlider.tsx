"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";

const PHOTOS = [
  { src: "/images/brothers.jpg", alt: "Братья Разумовские" },
  { src: "/images/konstantin.jpg", alt: "Константин Разумовский" },
  { src: "/images/oleg.jpg", alt: "Олег Разумовский" },
];

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
            <div className="relative w-full h-full border-2 border-gold rounded-lg overflow-hidden shadow-[0_0_20px_rgba(228,199,83,0.35)]">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority={idx < 2}
                className="object-contain object-center"
                sizes="33vw"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
