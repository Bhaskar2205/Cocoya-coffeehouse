"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star } from "lucide-react";
import { RATING_LABELS } from "@/lib/feedback/schema";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
};

/** Accessible 5-star rating (ARIA radiogroup with roving tabindex + arrow keys). */
export function StarRating({ value, onChange, labelledBy, describedBy, invalid }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const shown = hover || value;

  const select = (n: number, focus = false) => {
    const next = Math.max(1, Math.min(5, n));
    onChange(next);
    if (focus) refs.current[next - 1]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = value || 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      select(current + 1, true);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      select(current - 1, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(1, true);
    } else if (e.key === "End") {
      e.preventDefault();
      select(5, true);
    }
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-required="true"
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHover(0)}
        className="flex items-center gap-1 sm:gap-2"
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= shown;
          return (
            <motion.button
              key={n}
              ref={(el) => {
                refs.current[n - 1] = el;
              }}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} star${n > 1 ? "s" : ""} — ${RATING_LABELS[n - 1]}`}
              tabIndex={(value || 1) === n ? 0 : -1}
              onClick={() => select(n)}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(0)}
              whileHover={{ scale: 1.15, rotate: -6 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              className="grid size-12 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-caramel sm:size-14"
            >
              <motion.span
                key={filled ? `on-${value}-${hover ? "h" : "s"}` : "off"}
                initial={filled ? { scale: 0.55, opacity: 0.6 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 16, delay: hover ? 0 : (n - 1) * 0.045 }}
                className="grid place-items-center"
              >
                <Star
                  aria-hidden
                  strokeWidth={1.4}
                  className={cn(
                    "size-9 transition-colors duration-200 sm:size-10",
                    filled
                      ? "fill-gold text-gold drop-shadow-[0_4px_14px_rgb(214_178_122/0.55)]"
                      : invalid
                        ? "fill-transparent text-destructive/60"
                        : "fill-transparent text-cocoa/30",
                  )}
                />
              </motion.span>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-2 h-6 pl-1" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={shown}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={cn("text-sm font-semibold", shown ? "text-caramel-deep" : "text-cocoa/75")}
          >
            {shown ? RATING_LABELS[shown - 1] : "Tap a star to rate your visit"}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
