import type { CSSProperties } from "react";

/** Shared gradients for <Bean>. Render once per page section that uses beans. */
export function BeanDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <radialGradient id="bean-roasted" cx="0.34" cy="0.28" r="0.95">
          <stop offset="0" stopColor="#a8703f" />
          <stop offset="0.45" stopColor="#5e341b" />
          <stop offset="1" stopColor="#24120a" />
        </radialGradient>
        <linearGradient id="bean-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** A glossy roasted coffee bean. */
export function Bean({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="-14 -18 28 36" aria-hidden style={style} className={className}>
      <ellipse rx="12.5" ry="16.5" fill="url(#bean-roasted)" />
      <path d="M1.5 -15.5 C-7 -6 8 4 -1.5 15.5" fill="none" stroke="#170a04" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M2.6 -14 C-5 -6 9 4 -0.5 14" fill="none" stroke="#c48a55" strokeOpacity="0.35" strokeWidth="0.9" strokeLinecap="round" />
      <ellipse cx="-5" cy="-6" rx="3.2" ry="7" fill="url(#bean-sheen)" transform="rotate(18 -5 -6)" />
    </svg>
  );
}
