"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { Bean, BeanDefs } from "@/components/art/bean";
import { Photo } from "@/components/ui/photo";
import { BeanMark } from "@/components/brand";
import { Magnetic } from "@/components/magic/magnetic";
import { OpenStatus } from "@/components/open-status";
import { heroCopy } from "@/content/copy";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Floating beans: position (%), size (px), depth 0 (far) → 1 (near), rotation, show on mobile. */
const BEANS = [
  { x: 4, y: 14, s: 30, d: 0.25, r: -20, m: false },
  { x: 47, y: 10, s: 22, d: 0.15, r: 40, m: false },
  { x: 93, y: 12, s: 50, d: 0.85, r: 30, m: true },
  { x: 90, y: 74, s: 38, d: 0.6, r: -45, m: false },
  { x: 54, y: 86, s: 56, d: 1, r: 12, m: false },
  { x: 12, y: 82, s: 24, d: 0.2, r: 70, m: false },
];

/**
 * Hero — Cocoya's own photography, framed like an editorial cover:
 * the lantern-lit hall as a cinematic backdrop, the signature drink beneath
 * the glowing "cocoya" sign in a tall arched frame with a gold keyline.
 * Entrance animations are pure CSS (they paint instantly, no JS needed) and
 * pause behind the desktop intro curtain until it lifts.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      q("[data-bean-float]").forEach((b, i) => {
        gsap.to(b, { y: `+=${12 + (i % 4) * 6}`, rotation: `+=${i % 2 ? 18 : -14}`, duration: 4 + (i % 5), repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.2 });
      });

      // Scroll: layers drift apart at different speeds as you leave.
      const out = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      out
        .to(q("[data-hero-bg]"), { yPercent: 14, scale: 1.06, ease: "none" }, 0)
        .to(q("[data-arch-main]"), { yPercent: -10, ease: "none" }, 0)
        .to(q("[data-arch-second]"), { yPercent: -32, ease: "none" }, 0)
        .to(q("[data-hero-copy]"), { yPercent: -16, autoAlpha: 0, ease: "none" }, 0);
      q("[data-bean-depth]").forEach((b) => {
        const d = Number((b as HTMLElement).dataset.depth ?? 0.5);
        out.to(b, { yPercent: -120 * d - 30, ease: "none" }, 0);
      });

      // Mouse parallax on fine pointers.
      const mm = gsap.matchMedia();
      mm.add("(pointer: fine)", () => {
        const layers = q("[data-mouse]").map((node) => {
          const d = Number((node as HTMLElement).dataset.mouse ?? 0.5);
          return { d, x: gsap.quickTo(node, "x", { duration: 1.4, ease: "power3" }), y: gsap.quickTo(node, "y", { duration: 1.4, ease: "power3" }) };
        });
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.d * 60);
            l.y(ny * l.d * 40);
          });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const [line1, line2] = heroCopy.headline;
  const line2Words = line2.split(" ");
  const lastWord = line2Words.pop();

  return (
    <section id="top" ref={root} aria-labelledby="hero-title" className="relative isolate min-h-[100svh] overflow-hidden bg-espresso text-foam">
      <BeanDefs />

      {/* Backdrop — Cocoya's lantern-lit dining hall */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div data-hero-bg className="absolute inset-0">
          <div data-hero-anim className="absolute inset-0 animate-[settle_3.2s_var(--ease-cinematic)_both]">
            <Photo src="/images/cocoya/interior/dining-hall.jpg" alt="" fill sizes="100vw" quality={60} className="object-cover opacity-[0.42]" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/80 via-espresso/55 to-espresso lg:bg-gradient-to-r lg:from-espresso lg:via-espresso/75 lg:to-espresso/35" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-espresso to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(45%_55%_at_72%_48%,rgb(214_178_122/0.22),transparent_70%)]" />
        <div className="grain absolute inset-0" />
      </div>

      {BEANS.filter((b) => b.d < 0.5).map((b, i) => (
        <BeanLayer key={`back-${i}`} bean={b} />
      ))}

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[90rem] grid-cols-1 items-center gap-6 px-5 pt-24 pb-24 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pt-24 lg:pb-16">
        {/* ── Visual: arched photographs ─────────────────────────────── */}
        <div className="relative order-1 mx-auto h-[50svh] min-h-[340px] w-full max-w-[34rem] lg:order-2 lg:col-span-6 lg:col-start-7 lg:h-[80vh] lg:max-w-none">
          {/* Main arch */}
          <div data-arch-main className="absolute inset-y-0 right-[6%] aspect-[3/4] max-w-[86%] lg:right-[10%]">
            <div data-mouse="0.28" className="relative h-full w-full">
              {/* Gold keyline, offset */}
              <div
                data-hero-anim
                aria-hidden
                className="absolute inset-0 translate-x-3 translate-y-3 animate-[fade-in_1.4s_ease_1s_both] rounded-t-full rounded-b-[2rem] border border-gold/45 lg:translate-x-5 lg:translate-y-5"
              />
              <div className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-[2rem] shadow-[0_50px_120px_-40px_rgb(0_0_0/0.9)] ring-1 ring-gold/25">
                <div data-hero-anim className="absolute inset-0 animate-[settle_2.6s_var(--ease-cinematic)_0.15s_both]">
                  <Photo
                    src="/images/cocoya/drinks/mango-matcha.jpg"
                    alt="Cocoya's layered iced matcha drink on the counter beneath the glowing cocoya sign"
                    fill
                    preload
                    quality={85}
                    sizes="(min-width: 1024px) 40vw, 80vw"
                    className="object-cover object-[82%_50%]"
                  />
                </div>
                {/* Curtain reveal (the photo paints underneath immediately) */}
                <div data-hero-anim aria-hidden className="absolute inset-0 animate-[curtain-up_1.4s_cubic-bezier(0.65,0,0.35,1)_0.1s_both] bg-espresso" />
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-espresso/70 to-transparent" />
                <p
                  data-hero-anim
                  className="absolute right-5 bottom-5 flex animate-[fade-in_1s_ease_1.4s_both] items-center gap-2 rounded-full border border-foam/20 bg-espresso/40 px-4 py-1.5 text-[0.62rem] font-semibold tracking-[0.3em] whitespace-nowrap text-foam/90 uppercase backdrop-blur-md"
                >
                  <BeanMark className="size-3.5 text-gold" /> Made at Cocoya
                </p>
              </div>
            </div>
          </div>

          {/* Secondary arch */}
          <div data-arch-second className="absolute bottom-[4%] left-0 aspect-[3/4] h-[42%] lg:bottom-[2%] lg:left-[2%] lg:h-[44%]">
            <div data-mouse="0.6" className="h-full w-full">
              <div
                data-hero-anim
                className="relative h-full w-full animate-[rise-in_1.4s_var(--ease-cinematic)_0.7s_both] overflow-hidden rounded-t-full rounded-b-[1.4rem] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] ring-[6px] ring-espresso lg:ring-8"
              >
                <Photo
                  src="/images/cocoya/drinks/orange-espresso-glow.jpg"
                  alt="An orange espresso drink in a wine glass at Cocoya"
                  fill
                  quality={80}
                  sizes="(min-width: 1024px) 18vw, 32vw"
                  className="object-cover object-[50%_45%]"
                />
              </div>
            </div>
          </div>

          {/* Rotating seal */}
          <div data-hero-anim className="absolute top-[3%] left-[10%] z-10 animate-[pop-in_1s_var(--ease-cinematic)_1.2s_both] lg:top-[6%] lg:left-[14%]" aria-hidden>
            <div data-mouse="0.45" className="relative grid size-20 place-items-center rounded-full bg-espresso/70 backdrop-blur-md sm:size-28">
              <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-[spin_26s_linear_infinite] text-gold/80">
                <defs>
                  <path id="seal-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                </defs>
                <text className="fill-current text-[10px] font-semibold tracking-[0.36em] uppercase">
                  <textPath href="#seal-circle">Cocoya • Coffee House • Slow moments •</textPath>
                </text>
              </svg>
              <BeanMark className="size-7 text-gold sm:size-9" />
            </div>
          </div>
        </div>

        {/* ── Copy ─────────────────────────────────────────────────────── */}
        <div data-hero-copy className="relative order-2 lg:order-1 lg:col-span-6 lg:row-start-1">
          <p data-hero-anim className="eyebrow animate-fade-right text-gold [animation-delay:0.2s]">
            <BeanMark className="size-4" /> {heroCopy.eyebrow}
          </p>

          <h1 id="hero-title" className="font-display mt-5 text-[clamp(3.1rem,1.4rem+6vw,7.6rem)] leading-[0.9] font-light tracking-[-0.04em] lg:mt-7">
            <span className="sr-only">{heroCopy.headline.join(" ")}</span>
            <span aria-hidden className="block">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-anim className="block animate-rise [animation-delay:0.3s]">
                  {line1}
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.14em]">
                <span data-hero-anim className="block animate-rise [animation-delay:0.45s]">
                  {line2Words.join(" ")}{" "}
                  <em className="font-display-wonk bg-gradient-to-r from-gold via-[#f1d7a8] to-caramel bg-clip-text pr-2 font-normal text-transparent italic">
                    {lastWord}
                  </em>
                </span>
              </span>
            </span>
          </h1>

          <p data-hero-anim className="mt-5 max-w-md animate-fade-up text-base leading-relaxed text-pretty text-foam/75 [animation-delay:0.7s] sm:text-lg lg:mt-8">
            {heroCopy.supporting}
          </p>

          <div data-hero-anim className="mt-7 flex animate-fade-up flex-col gap-3 [animation-delay:0.85s] sm:flex-row sm:items-center sm:gap-4 lg:mt-10">
            <Magnetic>
              <a
                href={heroCopy.primaryCta.href}
                data-cursor="Menu"
                className="group relative inline-flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-cream px-8 text-[0.95rem] font-semibold text-espresso shadow-[0_18px_60px_-18px_rgb(214_178_122/0.7)] sm:w-auto"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-gold transition-transform duration-500 ease-cinematic group-hover:translate-y-0" />
                <span className="relative">{heroCopy.primaryCta.label}</span>
                <ArrowRight className="relative size-4 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={heroCopy.secondaryCta.href}
                className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-foam/20 px-7 text-[0.95rem] font-medium text-foam backdrop-blur-sm transition-colors duration-500 hover:border-gold hover:text-gold sm:w-auto"
              >
                {heroCopy.secondaryCta.label}
              </a>
            </Magnetic>
          </div>

          <dl data-hero-anim className="mt-10 hidden max-w-md animate-fade-up grid-cols-3 gap-6 border-t border-foam/10 pt-6 [animation-delay:1.1s] sm:grid lg:mt-14">
            {[
              ["Hot", "Slow mornings"],
              ["Iced", "Warm afternoons"],
              ["Matcha", "Something different"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-display text-xl text-cream">{k}</dt>
                <dd className="mt-1 text-xs text-foam/60">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {BEANS.filter((b) => b.d >= 0.5).map((b, i) => (
        <BeanLayer key={`front-${i}`} bean={b} front />
      ))}

      {/* Bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-[90rem] items-end justify-between px-5 pb-6 sm:px-6 lg:px-10">
        <a href="#story" className="group flex items-center gap-4 text-[0.62rem] font-semibold tracking-[0.4em] text-foam/60 uppercase">
          <span className="relative h-12 w-px overflow-hidden bg-foam/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-dot bg-gradient-to-b from-transparent to-gold" />
          </span>
          <span className="transition-colors group-hover:text-gold">Scroll</span>
        </a>
        <OpenStatus className="backdrop-blur-sm" />
      </div>
    </section>
  );
}

function BeanLayer({ bean, front = false }: { bean: (typeof BEANS)[number]; front?: boolean }) {
  const blur = bean.d < 0.2 ? 3 : bean.d > 0.85 ? 2.5 : bean.d < 0.35 ? 1.2 : 0;
  return (
    <div
      data-bean-depth
      data-depth={bean.d}
      aria-hidden
      className={cn("pointer-events-none absolute", front ? "z-20" : "z-0", !bean.m && "max-md:hidden")}
      style={{ left: `${bean.x}%`, top: `${bean.y}%` }}
    >
      <div data-mouse={bean.d}>
        <div data-bean-float style={{ rotate: `${bean.r}deg`, filter: blur ? `blur(${blur}px)` : undefined, opacity: 0.35 + bean.d * 0.65 }}>
          <Bean style={{ width: bean.s * (front ? 1 : 0.9), height: bean.s * 1.3 }} />
        </div>
      </div>
    </div>
  );
}
