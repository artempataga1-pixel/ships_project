"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";

export function LogoIntro() {
  const [visible, setVisible] = useState(true);
  const [initSize, setInitSize] = useState<number | null>(null);
  const controls = useAnimation();

  // Шаг 1: вычислить начальный размер на клиенте (экран / 1.5)
  useEffect(() => {
    setInitSize(Math.floor(Math.min(window.innerWidth, window.innerHeight) / 1.5));
  }, []);

  // Шаг 2: запустить анимацию после вычисления размера
  useEffect(() => {
    if (initSize === null) return;

    const run = async () => {
      // Фаза 1: логотип появляется по центру (0–0.8s)
      await controls.start({
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" },
      });

      // Фаза 2: уменьшается и летит в левый верхний угол (0.8–2.5s)
      await controls.start({
        width: 40,
        height: 40,
        top: 12,
        left: 16,
        x: 0,
        y: 0,
        transition: { duration: 1.7, ease: "easeInOut" },
      });

      // Фаза 3: оверлей исчезает
      setVisible(false);
    };

    run();
  }, [initSize, controls]);

  return (
    <AnimatePresence>
      {visible && initSize !== null && (
        <motion.div
          className="fixed inset-0 z-[100] bg-charcoal/85 backdrop-blur-sm cursor-pointer"
          onClick={() => setVisible(false)}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <motion.div
            className="absolute"
            animate={controls}
            initial={{
              width: initSize,
              height: initSize,
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              opacity: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo2.png"
              alt="Братья Разумовские и Партнёры"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
