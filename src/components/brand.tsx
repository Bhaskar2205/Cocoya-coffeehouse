import Image from "next/image";
import { Star } from "lucide-react";
import { site } from "@/content/site";
import type { Diet } from "@/content/menu";
import { cn } from "@/lib/utils";

/** Stylised coffee bean — the Cocoya mark. */
export function BeanMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)} fill="none">
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeOpacity="0.45" />
      <ellipse cx="16" cy="16" rx="7.2" ry="10" transform="rotate(28 16 16)" fill="currentColor" />
      <path
        d="M19.6 7.6c-3.6 2.6-1.4 6.2-3.4 8.8s-5.6 2.4-6.2 7.2"
        stroke="var(--wordmark-cut, #0d0806)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The Cocoya logotype — lowercase, rounded geometric strokes, drawn to echo
 * the café's backlit "cocoya" sign. Pure SVG (no font download). The soft glow
 * mimics the sign's warm backlight.
 */
export function Logotype({ className, glow = true, title }: { className?: string; glow?: boolean; title?: string }) {
  return (
    <svg
      viewBox="-3 -1 146 44"
      className={cn("h-7 w-auto overflow-visible", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeWidth="4.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={glow ? { filter: "drop-shadow(0 0 6px rgb(255 214 150 / 0.45))" } : undefined}
    >
      <path d="M17.4 13.6 A9 9 0 1 0 17.4 26.4" />
      <circle cx="34" cy="20" r="9" />
      <path d="M63.4 13.6 A9 9 0 1 0 63.4 26.4" />
      <circle cx="80" cy="20" r="9" />
      <path d="M95 11 L104.2 29.5 M113 11 L100.6 38" />
      <circle cx="127" cy="20" r="9" />
      <path d="M136 11 L136 29" />
    </svg>
  );
}

/** Brand wordmark (replaced automatically by `site.logo` when provided). */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  if (site.logo) {
    return <Image src={site.logo} alt={site.name} width={140} height={40} className={cn("h-9 w-auto", className)} />;
  }
  return (
    <span className={cn("inline-flex flex-col leading-none text-cream", className)}>
      <span className="sr-only">Cocoya</span>
      <Logotype className="h-[1.55rem] md:h-7" />
      {!compact && (
        <span className="mt-1.5 pl-0.5 text-[0.52rem] font-semibold tracking-[0.5em] text-current/70 uppercase">
          <span className="sr-only"> </span>Coffee House
        </span>
      )}
    </span>
  );
}

const DIET_META: Record<Diet, { label: string; color: string; shape: "dot" | "triangle" }> = {
  veg: { label: "Vegetarian", color: "var(--color-veg)", shape: "dot" },
  "non-veg": { label: "Non-vegetarian", color: "var(--color-nonveg)", shape: "triangle" },
  egg: { label: "Contains egg", color: "var(--color-egg)", shape: "dot" },
};

/** Indian FSSAI-style food marker: green dot (veg), red triangle (non-veg), amber (egg). */
export function DietMark({ diet, className }: { diet?: Diet | null; className?: string }) {
  if (!diet) return null;
  const meta = DIET_META[diet];
  return (
    <span
      role="img"
      aria-label={meta.label}
      title={meta.label}
      className={cn("inline-grid size-4 shrink-0 place-items-center rounded-[3px] border-[1.5px] bg-white", className)}
      style={{ borderColor: meta.color }}
    >
      {meta.shape === "dot" ? (
        <span className="size-2 rounded-full" style={{ background: meta.color }} />
      ) : (
        <span
          className="size-0 border-x-[4px] border-b-[7px] border-x-transparent"
          style={{ borderBottomColor: meta.color }}
        />
      )}
    </span>
  );
}

export function Stars({ rating, className, size = "size-4" }: { rating: number; className?: string; size?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(size, i < Math.round(rating) ? "fill-gold text-gold" : "fill-transparent text-current/30")}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
