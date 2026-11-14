/**
 * Illustrated coffee glass used by the hero, the Bean-to-Cup journey and the
 * Ratio Lab. Pure SVG — every animatable part carries a data attribute so a
 * parent GSAP timeline can drive it:
 *
 *   [data-liquid-body] [data-surface]  → liquid level (use setGlassLevel)
 *   [data-foam]                        → foam cap thickness (setGlassFoam)
 *   [data-marble] [data-marble-b]      → baked milk marbling (two seeds to crossfade)
 *   [data-ice]                         → ice cubes
 *   [data-droplets]                    → condensation
 *
 * Liquid colours are CSS variables on any ancestor, so tweening them turns
 * espresso into a latte:  --liq-1 (top) … --liq-4 (bottom), --surf, --milk.
 */
import type { CSSProperties, ReactNode, SVGProps } from "react";

export const GLASS = {
  width: 420,
  height: 600,
  innerTop: 72,
  innerBottom: 510,
  cx: 210,
  /** Liquid level when the glass is "empty" (just below the inner floor). */
  empty: 512,
};

/** Inner width of the tapered glass at a given y. */
export function glassWidthAt(y: number) {
  const t = Math.min(1, Math.max(0, (y - 72) / 428));
  return 260 - 45 * t;
}

const OUTER = "M72 66 L96 520 Q98 550 128 550 L292 550 Q322 550 324 520 L348 66";
const OUTER_CLOSED = `${OUTER} Z`;
const INNER = "M80 70 L102.6 500 Q104 511 116 511 L304 511 Q316 511 317.4 500 L340 70 Z";
const BASE = "M103 512 L317 512 L322 524 Q320 548 292 548 L128 548 Q100 548 98 524 Z";
const LEFT_HL = "M92 92 L104 92 L120 488 L112 492 Z";
const RIGHT_HL = "M326 96 L330 96 L314 480 L311 480 Z";

/** Deterministic pseudo-random generator (no Math.random during render). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(42);
const DROPLETS = Array.from({ length: 24 }, () => {
  const y = 110 + rand() * 390;
  const half = glassWidthAt(y) / 2 + 6;
  const side = rand() > 0.5 ? 1 : -1;
  const x = 210 + side * (half * (0.35 + rand() * 0.62));
  return { x, y, r: 1.2 + rand() * 3.4, o: 0.35 + rand() * 0.55 };
});

const ICE = [
  { x: 128, y: 120, s: 70, r: -12 },
  { x: 214, y: 104, s: 76, r: 9 },
  { x: 168, y: 176, s: 64, r: 24 },
];

type GlassArtProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** Unique id prefix (gradients, filters and clip paths must not collide). */
  uid: string;
  /** Initial liquid level (y in glass space, 72 = brim, 512 = empty). */
  level?: number;
  /** Initial foam cap thickness in px. */
  foam?: number;
  withIce?: boolean;
  /** Initial visibility of ice / droplets / milk clouds (animate later). */
  iceVisible?: boolean;
  dropletsVisible?: boolean;
  cloudsVisible?: boolean;
  /** Extra layers rendered inside the glass (clipped to the interior). */
  inside?: ReactNode;
  /** Extra layers rendered over the glass (not clipped), e.g. a pour stream. */
  over?: ReactNode;
  style?: CSSProperties;
};

export function GlassArt({
  uid,
  level = 160,
  foam = 0,
  withIce = true,
  iceVisible = true,
  dropletsVisible = true,
  cloudsVisible = true,
  inside,
  over,
  style,
  ...svgProps
}: GlassArtProps) {
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const rx = glassWidthAt(level) / 2;

  return (
    <svg viewBox="0 0 420 600" fill="none" aria-hidden overflow="visible" style={style} {...svgProps}>
      <defs>
        <clipPath id={id("inner")}>
          <path d={INNER} />
        </clipPath>
        {/* Follows the liquid level so marbling never floats above the surface */}
        <clipPath id={id("liquid")}>
          <rect data-liquid-clip x="60" y={level} width="300" height="600" />
        </clipPath>
        <clipPath id={id("outer")}>
          <path d={OUTER_CLOSED} />
        </clipPath>

        <linearGradient id={id("liq")} gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="0" y2="512">
          <stop offset="0" style={{ stopColor: "var(--liq-1, #3b1f12)" }} />
          <stop offset="0.42" style={{ stopColor: "var(--liq-2, #32190d)" }} />
          <stop offset="0.74" style={{ stopColor: "var(--liq-3, #28130a)" }} />
          <stop offset="1" style={{ stopColor: "var(--liq-4, #1a0c05)" }} />
        </linearGradient>
        <radialGradient id={id("surf")} cx="0.42" cy="0.35" r="0.8">
          <stop offset="0" style={{ stopColor: "var(--surf-hi, #d9a66d)" }} />
          <stop offset="0.7" style={{ stopColor: "var(--surf, #a8683a)" }} />
          <stop offset="1" style={{ stopColor: "var(--surf-lo, #6e3d1f)" }} />
        </radialGradient>
        <linearGradient id={id("foam")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf6ee" />
          <stop offset="0.7" stopColor="#efe3d1" />
          <stop offset="1" stopColor="#d9c2a3" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={id("volume")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.18" stopColor="#000" stopOpacity="0.08" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="0.82" stopColor="#000" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={id("hl")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("base")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={id("ice")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#e9f3f6" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.38" />
        </linearGradient>
        <radialGradient id={id("drop")} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
        </radialGradient>

        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={id("blur2")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* Contact shadow + warm caustic */}
      <ellipse cx="210" cy="560" rx="160" ry="15" fill="#000" opacity="0.55" filter={url("soft")} />
      <ellipse data-caustic cx="214" cy="556" rx="92" ry="7" fill="var(--caustic, #c98a4e)" opacity="0.35" filter={url("soft")} />

      {/* Back wall of the glass */}
      <path d={OUTER_CLOSED} fill="#fff" fillOpacity="0.035" />

      {/* Interior */}
      <g clipPath={url("inner")}>
        <rect data-liquid-body x="60" y={level} width="300" height="600" fill={url("liq")} />

        {/* Milk marbling, pre-rendered by scripts/marble.mjs (live SVG turbulence is too costly on phones) */}
        <g data-clouds opacity={cloudsVisible ? 1 : 0.01} clipPath={url("liquid")}>
          <image data-marble href="/images/art/marble-a.webp" x="60" y="120" width="300" height="360" preserveAspectRatio="none" />
          <image data-marble-b href="/images/art/marble-b.webp" x="60" y="120" width="300" height="360" preserveAspectRatio="none" opacity="0" />
        </g>

        <rect data-foam x="60" y={level} width="300" height={foam} fill={url("foam")} />
        <ellipse data-surface cx="210" cy={level} rx={rx} ry="11" fill={url("surf")} />

        {inside}

        {withIce && (
          <g data-ice-group opacity={iceVisible ? 1 : 0}>
            {ICE.map((c, i) => (
              <g key={i} data-ice transform={`translate(${c.x} ${c.y}) rotate(${c.r} ${c.s / 2} ${c.s / 2})`}>
                <rect width={c.s} height={c.s} rx="13" fill={url("ice")} stroke="#fff" strokeOpacity="0.6" strokeWidth="1.4" />
                <path
                  d={`M10 ${c.s * 0.28} Q${c.s * 0.2} 9 ${c.s * 0.48} 10`}
                  stroke="#fff"
                  strokeOpacity="0.85"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <rect x={c.s * 0.18} y={c.s * 0.55} width={c.s * 0.5} height={c.s * 0.2} rx="6" fill="#fff" opacity="0.12" />
              </g>
            ))}
          </g>
        )}

        <rect x="60" y="60" width="300" height="470" fill={url("volume")} />
      </g>

      {/* Glass front */}
      <path d={BASE} fill={url("base")} />
      <path d="M110 534 Q210 546 310 534" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      <path d={LEFT_HL} fill={url("hl")} filter={url("blur2")} />
      <path d={RIGHT_HL} fill={url("hl")} />
      <path d={OUTER} stroke="#fff" strokeOpacity="0.26" strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="210" cy="66" rx="138" ry="11" stroke="#fff" strokeOpacity="0.42" strokeWidth="1.6" />
      <path d="M74 68 Q210 88 346 68" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />

      <g data-droplets clipPath={url("outer")} opacity={dropletsVisible ? 1 : 0}>
        {DROPLETS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={url("drop")} opacity={d.o} />
        ))}
      </g>

      {over}
    </svg>
  );
}

/** Set the liquid level on a rendered GlassArt (call from GSAP onUpdate). */
export function setGlassLevel(root: Element | null, level: number) {
  if (!root) return;
  const body = root.querySelector("[data-liquid-body]");
  const surface = root.querySelector("[data-surface]");
  const foam = root.querySelector("[data-foam]");
  const clip = root.querySelector("[data-liquid-clip]");
  body?.setAttribute("y", String(level));
  clip?.setAttribute("y", String(level + 4));
  foam?.setAttribute("y", String(level));
  surface?.setAttribute("cy", String(level));
  surface?.setAttribute("rx", String(glassWidthAt(level) / 2));
}

export function setGlassFoam(root: Element | null, px: number) {
  root?.querySelector("[data-foam]")?.setAttribute("height", String(Math.max(0, px)));
}

/** Liquid palettes (CSS custom properties) for common drinks. */
export const LIQUID = {
  espresso: { "--liq-1": "#3b1f12", "--liq-2": "#32190d", "--liq-3": "#28130a", "--liq-4": "#1a0c05", "--surf": "#b5733f", "--surf-hi": "#e0ac70", "--surf-lo": "#7a4422", "--milk": "#f3e6d3" },
  cortado: { "--liq-1": "#b98a62", "--liq-2": "#8a5a38", "--liq-3": "#5b331b", "--liq-4": "#2c160a", "--surf": "#d9b48a", "--surf-hi": "#f1d9b8", "--surf-lo": "#a77a50", "--milk": "#f3e6d3" },
  latte: { "--liq-1": "#efe1cc", "--liq-2": "#d7b48d", "--liq-3": "#9d6a43", "--liq-4": "#3e2112", "--surf": "#efe2cf", "--surf-hi": "#fbf4ea", "--surf-lo": "#d8c0a0", "--milk": "#f6ecdf" },
  iced: { "--liq-1": "#e9d8c0", "--liq-2": "#c79c72", "--liq-3": "#7f4f2d", "--liq-4": "#2e170a", "--surf": "#e6d3b8", "--surf-hi": "#f8efe2", "--surf-lo": "#c9ab86", "--milk": "#f6ecdf" },
} satisfies Record<string, Record<string, string>>;
