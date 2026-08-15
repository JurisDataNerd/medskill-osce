import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function SplitText({
  text = "",
  className = "",
  delay = 30,
  duration = 0.5,
  splitType = "chars",
  from = { opacity: 0, y: 30 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-50px",
  textAlign = "center",
  onLetterAnimationComplete,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: rootMargin, amount: threshold });

  const words = text.split(" ");

  let charCounter = 0;

  return (
    <div ref={ref} className={`inline-block w-full ${className}`} style={{ textAlign }}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, charIndex) => {
            const currentIdx = charCounter++;
            return (
              <motion.span
                key={charIndex}
                className="inline-block"
                initial={from}
                animate={isInView ? to : from}
                transition={{
                  duration: duration,
                  delay: (currentIdx * delay) / 1000,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
                onAnimationComplete={() => {
                  if (currentIdx === text.length - 1 && onLetterAnimationComplete) {
                    onLetterAnimationComplete();
                  }
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </div>
  );
}
