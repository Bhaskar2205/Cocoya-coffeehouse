"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const EASE = [0.76, 0, 0.24, 1] as const;
const KEY = "cocoya-intro-seen";

declare global {
  interface Window {
    __cocoyaIntroDone?: boolean;
  }
}

/** Resolve when the intro curtain has lifted (immediately if it already has). */
export function onIntroDone(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (window.__cocoyaIntroDone) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener("cocoya:intro", handler, { once: true });
  return () => window.removeEventListener("cocoya:intro", handler);
}

/**
 * A short cinematic intro (≈1.8s): a cup fills with espresso while the
 * wordmark resolves, then the curtain lifts. Shown once per browser session,
 * skipped entirely for reduced-motion visitors. Clicking skips it.
 */
export function Preloader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // The pre-paint script in layout.tsx decides whether the curtain plays
    // (first desktop visit per session, motion allowed).
    const pending = document.documentElement.dataset.intro === "pending";
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* storage unavailable */
    }
    const t = setTimeout(() => setShow(false), pending ? 1900 : 0);
    return () => clearTimeout(t);
  }, []);

  // As the curtain lifts: resume the hero's paused entrance and notify listeners.
  useEffect(() => {
    if (show) return;
    delete document.documentElement.dataset.intro;
    window.__cocoyaIntroDone = true;
    window.dispatchEvent(new Event("cocoya:intro"));
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          aria-hidden
          onClick={() => setShow(false)}
          className="preloader-failsafe fixed inset-0 z-[90] hidden place-items-center bg-espresso text-foam lg:grid"
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 1, ease: EASE }}
          style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        >
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 120 120" className="size-24">
              <defs>
                <clipPath id="pl-cup">
                  <path d="M28 44 h56 v22 a28 28 0 0 1 -56 0 z" />
                </clipPath>
                <linearGradient id="pl-coffee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#c58b52" />
                  <stop offset="0.25" stopColor="#5a321a" />
                  <stop offset="1" stopColor="#1e0f07" />
                </linearGradient>
              </defs>
              {[0, 1, 2].map((i) => (
                <motion.path
                  key={i}
                  d={`M${46 + i * 10} 36 c-6 -8 6 -12 0 -22`}
                  stroke="#d6b27a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1, 1], opacity: [0, 0.8, 0], y: [4, -2, -8] }}
                  transition={{ duration: 1.6, delay: 0.5 + i * 0.18, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
              <g clipPath="url(#pl-cup)">
                <motion.rect
                  x="20"
                  width="80"
                  height="60"
                  fill="url(#pl-coffee)"
                  initial={{ y: 96 }}
                  animate={{ y: 46 }}
                  transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
                />
              </g>
              <path d="M28 44 h56 v22 a28 28 0 0 1 -56 0 z" fill="none" stroke="#f2e9dc" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M84 50 h6 a9 9 0 0 1 0 18 h-8" fill="none" stroke="#f2e9dc" strokeWidth="2.2" />
              <path d="M20 98 h80" stroke="#f2e9dc" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="mt-6 overflow-hidden">
              <motion.p
                className="font-display text-3xl tracking-[0.42em]"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                COCOYA
              </motion.p>
            </div>
            <motion.p
              className="mt-3 text-[0.6rem] font-semibold tracking-[0.5em] text-gold/80 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Brewing your experience
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
