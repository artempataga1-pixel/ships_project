"use client";
import { motion } from "framer-motion";

export function HeroScrollArrow() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      <motion.div
        className="w-px h-12 bg-gold/40"
        animate={{ scaleY: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ originY: 0 }}
      />
    </div>
  );
}
