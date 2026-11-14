"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  /** Fraction of the element that must be visible before it animates. */
  amount?: number;
};

/** Fade + rise into view once. Respects prefers-reduced-motion via MotionConfig. */
export function Reveal({ children, delay = 0, y = 28, amount = 0.25, className, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type RevealTextProps = {
  text: string;
  id?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Words to render in the accent style (italic caramel), matched case-insensitively. */
  accent?: string[];
  accentClassName?: string;
  delay?: number;
  /** Animate on mount instead of on scroll (used in the hero). */
  immediate?: boolean;
};

/**
 * Word-by-word masked text reveal. Screen readers get the plain sentence;
 * the animated words are aria-hidden.
 */
export function RevealText({
  text,
  id,
  as: Tag = "h2",
  className,
  accent = [],
  accentClassName = "italic text-caramel-deep",
  delay = 0,
  immediate = false,
}: RevealTextProps) {
  const words = text.split(" ");
  const accentSet = new Set(accent.map((w) => w.toLowerCase()));
  const animate = immediate ? { animate: "visible" as const } : { whileInView: "visible" as const, viewport: { once: true, amount: 0.6 } };

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        {...animate}
        transition={{ staggerChildren: 0.06, delayChildren: delay }}
        className="block"
      >
        {words.map((word, i) => {
          const isAccent = accentSet.has(word.replace(/[.,!?]/g, "").toLowerCase());
          return (
            <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
              <motion.span
                className={cn("inline-block will-change-transform", isAccent && accentClassName)}
                variants={{
                  hidden: { y: "110%", opacity: 0 },
                  visible: { y: "0%", opacity: 1, transition: { duration: 0.95, ease: EASE } },
                }}
              >
                {word}
              </motion.span>
              {i < words.length - 1 && " "}
            </span>
          );
        })}
      </motion.span>
    </Tag>
  );
}

/**
 * Image that wipes in from bottom to top with a slow settle-zoom.
 * The observer sits on an UNCLIPPED wrapper — an element that starts fully
 * clipped never reports as visible, so the reveal would never fire.
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn("relative", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
        variants={{
          hidden: { clipPath: "inset(100% 0% 0% 0%)" },
          visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.25, delay, ease: [0.65, 0, 0.35, 1] } },
        }}
      >
        <motion.div
          className="absolute inset-0"
          variants={{
            hidden: { scale: 1.2 },
            visible: { scale: 1, transition: { duration: 1.9, delay, ease: EASE } },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
