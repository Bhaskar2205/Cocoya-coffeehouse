"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { GlassArt, LIQUID, setGlassFoam, setGlassLevel } from "@/components/art/glass";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ratioCopy } from "@/content/copy";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const FLAT_WHITE = {
  "--liq-1": "#d2ab83",
  "--liq-2": "#a87850",
  "--liq-3": "#6e4122",
  "--liq-4": "#311a0c",
  "--surf": "#e6cba7",
  "--surf-hi": "#f6e7d2",
  "--surf-lo": "#b98c60",
  "--milk": "#f3e6d3",
};

/** Typical café proportions — they vary from bar to bar. */
const PRESETS = [
  {
    key: "espresso",
    name: "Espresso",
    ratio: "1 : 0",
    level: 446,
    foam: 0,
    vars: LIQUID.espresso,
    clouds: 0,
    ice: false,
    parts: { espresso: 100, milk: 0, foam: 0 },
    text: "A short, concentrated shot — bold and syrupy, crowned with golden crema.",
  },
  {
    key: "macchiato",
    name: "Macchiato",
    ratio: "1 : a dash",
    level: 424,
    foam: 24,
    vars: LIQUID.espresso,
    clouds: 0,
    ice: false,
    parts: { espresso: 78, milk: 0, foam: 22 },
    text: "Espresso “marked” with a spoonful of airy milk foam.",
  },
  {
    key: "cortado",
    name: "Cortado",
    ratio: "1 : 1",
    level: 340,
    foam: 8,
    vars: LIQUID.cortado,
    clouds: 0.6,
    ice: false,
    parts: { espresso: 50, milk: 45, foam: 5 },
    text: "Equal parts espresso and warm milk — smooth, strong and balanced.",
  },
  {
    key: "flat-white",
    name: "Flat White",
    ratio: "1 : 2",
    level: 268,
    foam: 10,
    vars: FLAT_WHITE,
    clouds: 0.8,
    ice: false,
    parts: { espresso: 34, milk: 58, foam: 8 },
    text: "Espresso with velvety microfoam — milky, yet coffee-forward.",
  },
  {
    key: "latte",
    name: "Latte",
    ratio: "1 : 3",
    level: 168,
    foam: 28,
    vars: LIQUID.latte,
    clouds: 1,
    ice: false,
    parts: { espresso: 25, milk: 63, foam: 12 },
    text: "Plenty of silky steamed milk under a soft cap of foam.",
  },
  {
    key: "iced-latte",
    name: "Iced Latte",
    ratio: "1 : 3 + ice",
    level: 150,
    foam: 0,
    vars: LIQUID.iced,
    clouds: 1,
    ice: true,
    parts: { espresso: 25, milk: 75, foam: 0 },
    text: "Espresso and cold milk poured over ice — marbled, mellow, refreshing.",
  },
] as const;

export function RatioLab() {
  const root = useRef<HTMLElement>(null);
  const glass = useRef<SVGSVGElement>(null);
  const [index, setIndex] = useState(4);
  const first = useRef(true);
  const state = useRef({ level: PRESETS[4].level, foam: PRESETS[4].foam });
  const preset = PRESETS[index];

  useGSAP(
    () => {
      const g = glass.current!;
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const apply = () => {
        setGlassLevel(g, state.current.level);
        setGlassFoam(g, state.current.foam);
      };
      const instant = first.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const d = instant ? 0 : 1.4;

      if (first.current) {
        gsap.set(q("[data-ice]"), { y: "-=340" });
        first.current = false;
      }

      gsap.to(state.current, { level: preset.level, foam: preset.foam, duration: d, ease: "power3.inOut", onUpdate: apply, overwrite: true });
      gsap.to(g, { ...preset.vars, duration: d * 1.1, ease: "sine.inOut", overwrite: "auto" });
      gsap.to(q("[data-clouds]"), { opacity: preset.clouds, duration: d * 0.8, overwrite: "auto" });
      gsap.fromTo(q("[data-marble]"), { scale: instant ? 1 : 0.4 }, { scale: 1, duration: d * 1.2, ease: "sine.out", transformOrigin: "50% 0%" });
      gsap.to(q("[data-droplets]"), { opacity: preset.ice ? 1 : 0, duration: d });

      const iceY = Number(gsap.getProperty(q("[data-ice]")[0]!, "y"));
      const iceIn = iceY > -100;
      if (preset.ice && !iceIn) gsap.to(q("[data-ice]"), { y: "+=340", duration: instant ? 0 : 0.9, ease: "bounce.out", stagger: 0.1, delay: instant ? 0 : 0.6 });
      if (!preset.ice && iceIn) gsap.to(q("[data-ice]"), { y: "-=340", duration: instant ? 0 : 0.6, ease: "power2.in" });

      if (!instant) {
        // A little swirl as the milk settles: crossfade between the two marbling seeds.
        gsap.fromTo(q("[data-marble-b]"), { opacity: 0.9 }, { opacity: 0, duration: 2.2, ease: "power2.out" });
        gsap.fromTo(g, { rotation: -2.5 }, { rotation: 0, duration: 1.4, ease: "elastic.out(1, 0.35)", transformOrigin: "50% 92%" });
      }
    },
    { scope: root, dependencies: [index] },
  );

  return (
    <section id="ratio" ref={root} aria-labelledby="ratio-title" className="relative overflow-hidden bg-cream text-roast">
      <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-5 py-28 sm:px-6 md:py-36 lg:grid-cols-12 lg:gap-16 lg:px-10">
        <div className="lg:col-span-5">
          <SectionHeading id="ratio-title" eyebrow={ratioCopy.eyebrow} title={ratioCopy.headline} accent={["balance."]} supporting={ratioCopy.supporting} />

          <Reveal delay={0.15} className="mt-10">
            <div role="radiogroup" aria-label="Choose a drink" className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => {
                const on = i === index;
                return (
                  <button
                    key={p.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative h-12 rounded-full px-5 text-sm font-semibold transition-colors duration-300",
                      on ? "text-foam" : "text-cocoa hover:text-roast",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId="ratio-pill"
                        className="absolute inset-0 rounded-full bg-roast"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {!on && <span className="absolute inset-0 rounded-full border border-roast/15" />}
                    <span className="relative">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <div className="mt-10 min-h-[11rem]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={preset.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-4xl font-light">{preset.name}</p>
                  <p className="font-display text-xl text-caramel-deep italic">{preset.ratio}</p>
                </div>
                <p className="mt-3 max-w-md leading-relaxed text-cocoa/80">{preset.text}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6">
              <div className="flex h-3 overflow-hidden rounded-full bg-roast/10">
                <motion.span className="h-full bg-[#3a1e10]" animate={{ width: `${preset.parts.espresso}%` }} transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }} />
                <motion.span className="h-full bg-[#d8b48c]" animate={{ width: `${preset.parts.milk}%` }} transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }} />
                <motion.span className="h-full bg-[#f6eee2]" animate={{ width: `${preset.parts.foam}%` }} transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }} />
              </div>
              <ul className="mt-3 flex gap-5 text-xs text-cocoa/70">
                <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#3a1e10]" /> Espresso</li>
                <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#d8b48c]" /> Milk</li>
                <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#f6eee2] ring-1 ring-roast/15" /> Foam</li>
              </ul>
              <p className="mt-4 text-xs text-cocoa/75">Typical café proportions — every bar pours a little differently.</p>
            </div>
          </div>
        </div>

        <Reveal delay={0.1} y={40} className="lg:col-span-7">
          <div className="grain relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-espresso shadow-[0_50px_120px_-50px_rgb(23_16_11/0.9)] sm:aspect-[5/5] lg:aspect-[6/6]">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_42%,rgb(214_178_122/0.28),transparent_75%)]" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
            <div aria-hidden className="absolute bottom-[9%] left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <div className="absolute inset-x-[10%] top-[8%] bottom-[9%]">
              <GlassArt
                ref={glass}
                uid="ratio"
                level={PRESETS[4].level}
                foam={PRESETS[4].foam}
                className="absolute inset-0 size-full overflow-visible"
              />
            </div>
            <p className="absolute top-6 left-7 text-[0.62rem] font-semibold tracking-[0.4em] text-foam/50 uppercase">The Ratio Lab</p>
            <p className="font-display absolute top-5 right-7 text-sm text-gold italic tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(PRESETS.length).padStart(2, "0")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
