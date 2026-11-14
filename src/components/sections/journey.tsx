"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { GlassArt, LIQUID, setGlassLevel } from "@/components/art/glass";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useNearViewport } from "@/hooks/use-near-viewport";
import { journeyCopy } from "@/content/copy";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

const STEPS = journeyCopy.steps;
const N = STEPS.length;

// ── Deterministic layout for beans and particles ───────────────────────────
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const r1 = seeded(7);
const DRUM_BEANS = Array.from({ length: 30 }, () => {
  const y = 398 + r1() * 96;
  const half = Math.sqrt(Math.max(0, 146 * 146 - (y - 360) * (y - 360))) - 16;
  return { x: 320 + (r1() * 2 - 1) * half * 0.9, y, r: r1() * 360, drop: 220 + r1() * 160, s: 0.9 + r1() * 0.35 };
});
const r2 = seeded(19);
const HOPPER_BEANS = Array.from({ length: 16 }, () => {
  const y = 132 + r2() * 82;
  const half = 86 - ((y - 96) / 134) * 50 - 14;
  return { x: 320 + (r2() * 2 - 1) * half, y, r: r2() * 360 };
});
const r3 = seeded(31);
const GROUNDS = Array.from({ length: 28 }, () => ({ dx: (r3() * 2 - 1) * 34, dy: 50 + r3() * 10, r: 1.2 + r3() * 2 }));
const SPARKLES = [
  { x: 196, y: 330, s: 1 },
  { x: 452, y: 372, s: 0.7 },
  { x: 432, y: 300, s: 0.5 },
  { x: 200, y: 470, s: 0.6 },
];

const ROAST_STAGES = ["Green", "Yellow", "Cinnamon", "Medium", "Dark"];

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<SVGSVGElement>(null);
  const glass = useRef<SVGSVGElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Defer building ~200 tweens until the visitor is a screen or two away —
  // keeps the initial page load light on phones.
  const near = useNearViewport(root, "150% 0px");

  useGSAP(
    () => {
      if (!near) return;
      const el = root.current!;
      const g = glass.current!;
      const st = stage.current!;
      const q = gsap.utils.selector(el);
      const level = { v: 512 };
      const setLevel = () => setGlassLevel(g, level.v);

      // ── Initial state ───────────────────────────────────────────────────
      gsap.set(st, { "--jbean": "#a3b36c" });
      gsap.set(g, LIQUID.espresso);
      setLevel();
      gsap.set(q("[data-scene='grind'], [data-pf], [data-scene='machine'], [data-sparkle], [data-serve-glow]"), { autoAlpha: 0 });
      gsap.set(q("[data-glass-holder]"), { autoAlpha: 0, y: 60 });
      gsap.set(q("[data-esp-stream], [data-milk-stream], [data-smoke]"), { drawSVG: "0%" });
      gsap.set(q("[data-pitcher]"), { x: 320, autoAlpha: 0 });
      gsap.set(q("[data-clouds]"), { opacity: 0 });
      gsap.set(q("[data-marble]"), { scale: 0.1, transformOrigin: "50% 0%" });
      gsap.set(q("[data-ice]"), { y: "-=340" });
      gsap.set(q("[data-droplets]"), { opacity: 0 });
      gsap.set(q("[data-mound]"), { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(q("[data-ground]"), { opacity: 0 });
      q("[data-rbean]").forEach((b, i) => gsap.set(b, { y: `-=${DRUM_BEANS[i]!.drop}` }));

      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      // 01 Select — green beans pour into the drum
      q("[data-rbean]").forEach((b, i) => {
        tl.to(b, { y: `+=${DRUM_BEANS[i]!.drop}`, duration: 0.4, ease: "bounce.out" }, 0.05 + i * 0.016);
      });

      // 02 Roast — tumble, colour shift, heat, smoke, meter
      tl.to(q("[data-drum-beans]"), { rotation: 720, svgOrigin: "320 360", duration: 0.95, ease: "power1.inOut" }, 1)
        .to(st, { keyframes: [{ "--jbean": "#d1b468" }, { "--jbean": "#b07a43" }, { "--jbean": "#74431f" }, { "--jbean": "#3f2213" }], duration: 0.9 }, 1.02)
        .to(q("[data-heat]"), { keyframes: [{ opacity: 0.9 }, { opacity: 0.55 }, { opacity: 1 }, { opacity: 0.7 }, { opacity: 0.95 }], duration: 0.9 }, 1)
        .to(q("[data-smoke]"), { drawSVG: "100%", duration: 0.6, stagger: 0.1 }, 1.25)
        .to(q("[data-smoke]"), { y: -40, opacity: 0, duration: 0.4, stagger: 0.1 }, 1.65)
        .to(q("[data-meter-dot]"), { x: 300, duration: 0.9, ease: "power1.inOut" }, 1.02)
        .to(q("[data-meter-fill]"), { attr: { width: 300 }, duration: 0.9, ease: "power1.inOut" }, 1.02)
        .to(q("[data-heat]"), { opacity: 0, duration: 0.15 }, 1.92);

      // 03 Grind
      tl.to(q("[data-scene='roast']"), { autoAlpha: 0, scale: 0.88, svgOrigin: "320 360", duration: 0.22 }, 1.95)
        .fromTo(q("[data-scene='grind']"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.22 }, 2.05)
        .fromTo(q("[data-pf]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.22 }, 2.1)
        .to(q("[data-burr]"), { rotation: 1080, svgOrigin: "320 296", duration: 0.85 }, 2.15)
        .to(q("[data-hbean]"), { y: (i: number) => 236 - HOPPER_BEANS[i]!.y, x: (i: number) => (320 - HOPPER_BEANS[i]!.x) * 0.8, scale: 0.2, opacity: 0, duration: 0.25, stagger: 0.035 }, 2.15)
        .to(q("[data-mound]"), { scaleY: 1, duration: 0.7, ease: "power1.out" }, 2.25);
      q("[data-ground]").forEach((p, i) => {
        const d = GROUNDS[i]!;
        tl.fromTo(p, { opacity: 0, x: 0, y: 0 }, { opacity: 1, x: d.dx, y: d.dy, duration: 0.14, ease: "power1.in" }, 2.2 + i * 0.023)
          .to(p, { opacity: 0, duration: 0.05 }, 2.36 + i * 0.023);
      });

      // 04 Extract
      tl.to(q("[data-scene='grind']"), { autoAlpha: 0, y: -30, duration: 0.2 }, 2.95)
        .fromTo(q("[data-scene='machine']"), { autoAlpha: 0, y: -50 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 3)
        .to(q("[data-pf]"), { y: -266, duration: 0.3, ease: "power2.inOut" }, 3.1)
        .to(q("[data-glass-holder]"), { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, 3.25)
        .to(q("[data-esp-stream]"), { drawSVG: "100%", duration: 0.15, stagger: 0.03 }, 3.45)
        .to(level, { v: 428, duration: 0.45, onUpdate: setLevel }, 3.5)
        .to(q("[data-esp-stream]"), { drawSVG: "100% 100%", duration: 0.1, stagger: 0.03 }, 3.92);

      // 05 Pour
      tl.to(q("[data-pitcher]"), { x: 0, autoAlpha: 1, duration: 0.2, ease: "power2.out" }, 4)
        .to(q("[data-pitcher-tilt]"), { rotation: -44, transformOrigin: "0% 0%", duration: 0.15, ease: "power2.inOut" }, 4.15)
        .to(q("[data-milk-stream]"), { drawSVG: "100%", duration: 0.1 }, 4.24)
        .to(q("[data-clouds]"), { opacity: 1, duration: 0.1 }, 4.26)
        .to(q("[data-marble]"), { scale: 1, duration: 0.6, ease: "sine.out" }, 4.26)
        .to(q("[data-marble-b]"), { opacity: 0.7, duration: 0.5 }, 4.55)
        .to(level, { v: 150, duration: 0.62, onUpdate: setLevel, ease: "power1.inOut" }, 4.28)
        .to(g, { ...LIQUID.iced, duration: 0.65 }, 4.3)
        .to(q("[data-milk-stream]"), { drawSVG: "100% 100%", duration: 0.08 }, 4.9)
        .to(q("[data-pitcher-tilt]"), { rotation: 0, duration: 0.12 }, 4.94)
        .to(q("[data-pitcher]"), { x: 320, autoAlpha: 0, duration: 0.18, ease: "power2.in" }, 5.02);

      // 06 Serve
      tl.to(q("[data-scene='machine'], [data-pf]"), { autoAlpha: 0, y: "-=60", duration: 0.2 }, 5.02)
        .to(q("[data-ice]"), { y: "+=340", duration: 0.32, stagger: 0.06, ease: "bounce.out" }, 5.1)
        .to(q("[data-droplets]"), { opacity: 1, duration: 0.3 }, 5.3)
        .to(q("[data-glass-holder]"), { scale: 1.32, y: -110, svgOrigin: "320 450", duration: 0.45, ease: "power2.inOut" }, 5.12)
        .to(q("[data-serve-glow]"), { autoAlpha: 1, duration: 0.3 }, 5.3)
        .fromTo(q("[data-sparkle]"), { autoAlpha: 0, scale: 0, svgOrigin: "320 400" }, { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.05, ease: "back.out(3)" }, 5.45)
        .to({}, { duration: 0.35 });

      if (reduced) {
        tl.progress(1);
        return;
      }

      ScrollTrigger.create({
        trigger: q("[data-journey-pin]")[0],
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        animation: tl,
        onUpdate: (self) => {
          const idx = Math.min(N - 1, Math.floor(self.progress * N * 0.9999));
          setActive((prev) => (prev === idx ? prev : idx));
          progressBar.current?.style.setProperty("--p", String(self.progress));
        },
      });
    },
    { scope: root, dependencies: [reduced, near] },
  );

  const step = STEPS[active]!;

  return (
    <section id="craft" ref={root} aria-labelledby="craft-title" className="relative bg-espresso text-foam">
      <div className="mx-auto max-w-[90rem] px-5 pt-28 pb-10 sm:px-6 md:pt-36 lg:px-10">
        <Reveal y={12}>
          <p className="eyebrow text-gold">{journeyCopy.eyebrow}</p>
        </Reveal>
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <RevealText
            as="h2"
            id="craft-title"
            text={journeyCopy.headline}
            accent={["cup."]}
            accentClassName="italic text-gold"
            className="font-display max-w-3xl text-headline font-light tracking-[-0.025em]"
          />
          <Reveal delay={0.15}>
            <p className="max-w-sm text-base leading-relaxed text-foam/65">{journeyCopy.supporting}</p>
          </Reveal>
        </div>
      </div>

      <div data-journey-pin className={cn("relative", reduced ? "" : "h-[560svh] lg:h-[640vh]")}>
        <div className={cn("flex flex-col overflow-hidden", reduced ? "" : "sticky top-0 h-[100svh]")}>
          {/* Ambient light */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-[62%] size-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(185_130_80/0.14),transparent)] max-lg:top-[62%] max-lg:left-1/2" />
            <div className="grain absolute inset-0" />
          </div>

          <div className="relative mx-auto grid h-full w-full max-w-[90rem] grid-rows-[auto_1fr] gap-2 px-5 pt-20 pb-6 sm:px-6 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:px-10 lg:pt-16 lg:pb-10">
            {/* Chapter text */}
            <div className="lg:col-span-4">
              {reduced ? (
                <ol className="flex flex-col gap-6">
                  {STEPS.map((s, i) => (
                    <li key={s.key}>
                      <p className="font-display text-sm text-gold italic">{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="font-display text-3xl font-light">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-foam/70">{s.text}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="relative min-h-[11.5rem] sm:min-h-[10rem] lg:min-h-[22rem]" aria-live="polite">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="font-display text-base text-gold italic tabular-nums lg:text-lg">
                        {String(active + 1).padStart(2, "0")} <span className="text-foam/55">/ {String(N).padStart(2, "0")}</span>
                      </p>
                      <h3 className="font-display mt-2 text-[2.6rem] leading-none font-light tracking-tight lg:mt-4 lg:text-[5.5rem]">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-pretty text-foam/70 lg:mt-6 lg:text-lg">{step.text}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {!reduced && (
                <div ref={progressBar} className="mt-4 hidden lg:mt-10 lg:block" style={{ "--p": 0 } as React.CSSProperties}>
                  <ol className="flex gap-2" aria-label="Brewing steps">
                    {STEPS.map((s, i) => (
                      <li key={s.key} className="flex-1">
                        <span className="block h-[2px] overflow-hidden rounded-full bg-foam/12">
                          <span
                            className="block h-full origin-left bg-gold"
                            style={{ transform: `scaleX(clamp(0, calc(var(--p) * ${N} - ${i}), 1))` }}
                          />
                        </span>
                        <span className={cn("mt-2 block text-[0.65rem] font-semibold tracking-[0.18em] uppercase transition-colors", i === active ? "text-gold" : "text-foam/55")}>
                          {s.title}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Stage */}
            <div className="relative min-h-0 lg:col-span-8 lg:h-full">
              <svg
                ref={stage}
                viewBox="0 0 640 700"
                className={cn("absolute inset-0 size-full overflow-visible transition-opacity duration-700", near ? "opacity-100" : "opacity-0")}
                aria-hidden
              >
                {near && (
                  <>
                <defs>
                  <radialGradient id="j-metal" cx="0.35" cy="0.3" r="0.9">
                    <stop offset="0" stopColor="#3a2a20" />
                    <stop offset="0.6" stopColor="#1d140e" />
                    <stop offset="1" stopColor="#0d0806" />
                  </radialGradient>
                  <linearGradient id="j-chrome" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#6d625a" />
                    <stop offset="0.22" stopColor="#e8e2da" />
                    <stop offset="0.45" stopColor="#8d837b" />
                    <stop offset="0.7" stopColor="#d5cec6" />
                    <stop offset="1" stopColor="#544a43" />
                  </linearGradient>
                  <linearGradient id="j-body" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#120c08" />
                    <stop offset="0.35" stopColor="#3b2b20" />
                    <stop offset="0.6" stopColor="#24180f" />
                    <stop offset="1" stopColor="#0f0a07" />
                  </linearGradient>
                  <radialGradient id="j-heat" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#ffb25a" stopOpacity="0.95" />
                    <stop offset="0.45" stopColor="#d4651f" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#7a2b0a" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="j-esp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#c58b52" />
                    <stop offset="0.3" stopColor="#6b3a1c" />
                    <stop offset="1" stopColor="#2a1309" />
                  </linearGradient>
                  <linearGradient id="j-milk" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#e5d6bf" />
                    <stop offset="0.45" stopColor="#fdf8f0" />
                    <stop offset="1" stopColor="#d9c7ad" />
                  </linearGradient>
                  <linearGradient id="j-meter" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#a3b36c" />
                    <stop offset="0.3" stopColor="#d1b468" />
                    <stop offset="0.55" stopColor="#b07a43" />
                    <stop offset="0.8" stopColor="#74431f" />
                    <stop offset="1" stopColor="#3f2213" />
                  </linearGradient>
                  <radialGradient id="j-glow" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#d6b27a" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#d6b27a" stopOpacity="0" />
                  </radialGradient>
                  <clipPath id="j-window">
                    <circle cx="320" cy="360" r="148" />
                  </clipPath>
                  <clipPath id="j-hopper">
                    <path d="M236 96 L404 96 L360 230 L280 230 Z" />
                  </clipPath>
                  <g id="j-bean">
                    <ellipse rx="9" ry="12.5" style={{ fill: "var(--jbean)" }} />
                    <path d="M1 -11.5 C-5.5 -4.5 6 3 -1 11.5" stroke="#000" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <ellipse cx="-3.6" cy="-4.6" rx="2.4" ry="5.2" fill="#fff" opacity="0.2" transform="rotate(18 -3.6 -4.6)" />
                  </g>
                  <g id="j-bean-roasted">
                    <ellipse rx="9" ry="12.5" fill="#4a2a16" />
                    <path d="M1 -11.5 C-5.5 -4.5 6 3 -1 11.5" stroke="#170a04" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <ellipse cx="-3.6" cy="-4.6" rx="2.4" ry="5.2" fill="#fff" opacity="0.16" transform="rotate(18 -3.6 -4.6)" />
                  </g>
                </defs>

                {/* ── 01–02 Roaster ─────────────────────────────────────── */}
                <g data-scene="roast">
                  <ellipse data-heat cx="320" cy="588" rx="190" ry="40" fill="url(#j-heat)" opacity="0" />
                  <circle cx="320" cy="360" r="196" fill="url(#j-metal)" stroke="#d6b27a" strokeOpacity="0.28" strokeWidth="1.5" />
                  <circle cx="320" cy="360" r="172" fill="none" stroke="#f2e9dc" strokeOpacity="0.08" strokeWidth="14" />
                  {Array.from({ length: 12 }, (_, i) => {
                    const a = (i / 12) * Math.PI * 2;
                    // Rounded: trig results can differ in the last digit between server and browser.
                    return <circle key={i} cx={(320 + Math.cos(a) * 182).toFixed(2)} cy={(360 + Math.sin(a) * 182).toFixed(2)} r="3.2" fill="#d6b27a" opacity="0.45" />;
                  })}
                  <circle cx="320" cy="360" r="150" fill="#0a0604" stroke="#d6b27a" strokeOpacity="0.4" strokeWidth="2" />
                  <g clipPath="url(#j-window)">
                    <g data-drum-beans>
                      {DRUM_BEANS.map((b, i) => (
                        <g key={i} data-rbean transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.r.toFixed(0)}) scale(${b.s.toFixed(2)})`}>
                          <use href="#j-bean" />
                        </g>
                      ))}
                    </g>
                    <path d="M200 280 A150 150 0 0 1 300 214" stroke="#fff" strokeOpacity="0.22" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <path d="M196 312 A150 150 0 0 1 206 290" stroke="#fff" strokeOpacity="0.16" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </g>
                  {[0, 1, 2].map((i) => (
                    <path
                      key={i}
                      data-smoke
                      d={`M${290 + i * 30} 168 C${276 + i * 30} 138 ${306 + i * 30} 118 ${292 + i * 30} 84 S${300 + i * 30} 40 ${290 + i * 30} 20`}
                      stroke="#f2e9dc"
                      strokeOpacity="0.32"
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                      style={{ filter: "blur(3px)" }}
                    />
                  ))}
                  {/* Roast meter */}
                  <g transform="translate(170 640)">
                    <rect width="300" height="4" rx="2" fill="#f2e9dc" opacity="0.1" />
                    <rect data-meter-fill width="0" height="4" rx="2" fill="url(#j-meter)" />
                    <circle data-meter-dot cx="0" cy="2" r="7" fill="#f2e9dc" stroke="#0d0806" strokeWidth="3" />
                    {ROAST_STAGES.map((label, i) => (
                      <text
                        key={label}
                        x={i * 75}
                        y="30"
                        textAnchor="middle"
                        fill="#f2e9dc"
                        fillOpacity="0.6"
                        className="text-[15px] tracking-[1px] lg:text-[11px] lg:tracking-[2px]"
                        style={{ fontFamily: "var(--font-manrope)", fontWeight: 600, textTransform: "uppercase" }}
                      >
                        {label}
                      </text>
                    ))}
                  </g>
                </g>

                {/* ── 03 Grinder ────────────────────────────────────────── */}
                <g data-scene="grind">
                  <path d="M236 96 L404 96 L360 230 L280 230 Z" fill="#fff" fillOpacity="0.05" />
                  <g clipPath="url(#j-hopper)">
                    {HOPPER_BEANS.map((b, i) => (
                      <g key={i} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`}>
                        <g data-hbean transform={`rotate(${b.r.toFixed(0)})`}>
                          <use href="#j-bean-roasted" />
                        </g>
                      </g>
                    ))}
                  </g>
                  <path d="M236 96 L404 96 L360 230 L280 230 Z" fill="none" stroke="#f2e9dc" strokeOpacity="0.45" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M246 104 L268 104 L292 220" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <ellipse cx="320" cy="96" rx="84" ry="8" fill="none" stroke="#f2e9dc" strokeOpacity="0.4" strokeWidth="1.5" />
                  <path d="M262 230 L378 230 L384 352 Q384 366 370 366 L270 366 Q256 366 256 352 Z" fill="url(#j-body)" stroke="#d6b27a" strokeOpacity="0.35" strokeWidth="1.5" />
                  <circle cx="320" cy="296" r="38" fill="#0a0604" stroke="#d6b27a" strokeOpacity="0.4" strokeWidth="1.5" />
                  <g data-burr>
                    {Array.from({ length: 14 }, (_, i) => (
                      <path
                        key={i}
                        d="M320 296 L320 264"
                        stroke="#d6b27a"
                        strokeOpacity="0.7"
                        strokeWidth="3"
                        strokeLinecap="round"
                        transform={`rotate(${(i / 14) * 360} 320 296)`}
                      />
                    ))}
                    <circle cx="320" cy="296" r="9" fill="#d6b27a" />
                  </g>
                  <rect x="306" y="366" width="28" height="18" rx="3" fill="url(#j-chrome)" />
                  {GROUNDS.map((p, i) => (
                    <circle key={i} data-ground cx="320" cy="388" r={p.r.toFixed(1)} fill="#4a2c1b" />
                  ))}
                </g>

                {/* ── 04 Group head ─────────────────────────────────────── */}
                <g data-scene="machine">
                  <path d="M150 0 L490 0 L490 96 Q490 124 462 124 L178 124 Q150 124 150 96 Z" fill="url(#j-body)" stroke="#d6b27a" strokeOpacity="0.3" strokeWidth="1.5" />
                  <rect x="150" y="40" width="340" height="3" fill="#d6b27a" opacity="0.35" />
                  <text x="320" y="88" textAnchor="middle" fill="#d6b27a" fillOpacity="0.7" fontSize="13" letterSpacing="8" style={{ fontFamily: "var(--font-fraunces)" }}>
                    COCOYA
                  </text>
                  <path d="M244 124 L396 124 L388 150 L252 150 Z" fill="url(#j-chrome)" />
                  <ellipse cx="320" cy="152" rx="70" ry="9" fill="url(#j-chrome)" />
                </g>

                {/* ── Portafilter (grind → extract) ─────────────────────── */}
                <g data-pf>
                  <path d="M120 452 L246 446 L248 466 L122 476 Q110 476 110 464 Q110 452 120 452 Z" fill="#1a110b" stroke="#d6b27a" strokeOpacity="0.35" strokeWidth="1.5" />
                  <path d="M246 436 L394 436 L384 470 Q320 494 256 470 Z" fill="url(#j-chrome)" />
                  <path data-mound d="M258 438 Q320 404 382 438 Z" fill="#3a2214" />
                  <path d="M300 482 L310 482 L308 494 L302 494 Z M330 482 L340 482 L338 494 L332 494 Z" fill="url(#j-chrome)" />
                </g>

                {/* ── Espresso streams ──────────────────────────────────── */}
                <path data-esp-stream d="M305 228 C305 320 312 420 316 548" stroke="url(#j-esp)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                <path data-esp-stream d="M335 228 C335 320 328 420 324 548" stroke="url(#j-esp)" strokeWidth="4.5" strokeLinecap="round" fill="none" />

                {/* Milk stream sits behind the glass so the liquid hides it below the surface */}
                <path data-milk-stream d="M321 246 C320 330 321 430 320 548" stroke="url(#j-milk)" strokeWidth="9" strokeLinecap="round" fill="none" />

                {/* ── Glass ─────────────────────────────────────────────── */}
                <ellipse data-serve-glow cx="320" cy="420" rx="230" ry="260" fill="url(#j-glow)" />
                <g data-glass-holder>
                  <GlassArt ref={glass} uid="journey" level={512} x={215} y={300} width={210} height={300} />
                </g>
                {SPARKLES.map((s, i) => (
                  <path
                    key={i}
                    data-sparkle
                    d={`M${s.x} ${s.y - 14 * s.s} Q${s.x} ${s.y} ${s.x + 14 * s.s} ${s.y} Q${s.x} ${s.y} ${s.x} ${s.y + 14 * s.s} Q${s.x} ${s.y} ${s.x - 14 * s.s} ${s.y} Q${s.x} ${s.y} ${s.x} ${s.y - 14 * s.s} Z`}
                    fill="#f1d7a8"
                  />
                ))}

                {/* ── Milk pitcher ──────────────────────────────────────── */}
                <g data-pitcher transform="translate(331 244)">
                  <g data-pitcher-tilt>
                    <path d="M-10 -2 L4 4 L6 14 Z" fill="url(#j-chrome)" />
                    <path d="M2 2 L98 -2 L108 128 Q108 142 94 142 L22 142 Q8 142 8 128 Z" fill="url(#j-chrome)" />
                    <path d="M14 10 L22 132" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
                    <path d="M100 22 C138 26 140 98 104 106" stroke="url(#j-chrome)" strokeWidth="9" strokeLinecap="round" fill="none" />
                  </g>
                </g>
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
