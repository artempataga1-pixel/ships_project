"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";

export function LogoIntro() {
  const [visible, setVisible] = useState(true);
  const controls = useAnimation();

  useEffect(() => {
    const run = async () => {
      // Фаза 1: логотип появляется по центру (0–0.8s)
      await controls.start({
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" },
      });

      // Фаза 2: уменьшается и летит в левый верхний угол (0.8–2.5s)
      await controls.start({
        width: 36,
        height: 36,
        top: 12,
        left: 24,
        x: 0,
        y: 0,
        transition: { duration: 1.7, ease: "easeInOut" },
      });

      // Фаза 3: оверлей исчезает
      setVisible(false);
    };

    run();
  }, [controls]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-charcoal/85 backdrop-blur-sm cursor-pointer"
          onClick={() => setVisible(false)}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <motion.div
            className="absolute"
            animate={controls}
            initial={{
              width: 180,
              height: 180,
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              opacity: 0,
            }}
          >
            <Image
              src="/images/logo2.png"
              alt="Братья Разумовские и Партнёры"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
