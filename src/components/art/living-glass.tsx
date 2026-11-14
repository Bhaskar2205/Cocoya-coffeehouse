"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { GlassArt, LIQUID, setGlassLevel } from "@/components/art/glass";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

/**
 * The animated iced-latte glass: ice drops in, milk pours and marbles through
 * the espresso, condensation forms and annotation lines draw in. Plays once
 * when scrolled into view; a gentle swirl continues on desktop.
 */
export function LivingGlass({ uid, className, annotations = true }: { uid: string; className?: string; annotations?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const glass = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const g = glass.current!;
      const q = gsap.utils.selector(wrap.current);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const streamInner = g.querySelector<SVGRectElement>("[data-stream-inner]");
      const splash = q("[data-splash]");
      const setLevel = (v: number) => {
        setGlassLevel(g, v);
        streamInner?.setAttribute("height", String(Math.max(0, v - 60)));
        splash.forEach((s) => s.setAttribute("cy", String(v)));
      };

      if (reduce) {
        gsap.set(g, LIQUID.iced);
        setLevel(150);
        gsap.set(q("[data-stream]"), { autoAlpha: 0 });
        gsap.set(q("[data-ice-group], [data-droplets], [data-clouds]"), { opacity: 1 });
        return;
      }

      gsap.set(g, LIQUID.espresso);
      setLevel(436);
      gsap.set(q("[data-clouds]"), { opacity: 0.01 });
      gsap.set(q("[data-marble]"), { scale: 0.12, transformOrigin: "50% 0%" });
      gsap.set(q("[data-ice]"), { y: "-=330" });
      gsap.set(q("[data-ice-group]"), { opacity: 1 });
      gsap.set(q("[data-droplets]"), { opacity: 0 });
      gsap.set(q("[data-stream]"), { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(q("[data-annot-line]"), { drawSVG: "0%" });
      gsap.set(q("[data-annot-label]"), { autoAlpha: 0, y: 6 });

      const level = { v: 436 };
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      tl.to(q("[data-ice]"), { y: "+=580", duration: 1, ease: "bounce.out", stagger: 0.16 }, 0.1)
        .to(q("[data-stream]"), { scaleY: 1, duration: 0.45, ease: "power2.in" }, 1.2)
        .fromTo(splash, { attr: { rx: 4, ry: 1 }, opacity: 0.9 }, { attr: { rx: 46, ry: 8 }, opacity: 0, duration: 0.7, repeat: 4, stagger: 0.25, ease: "sine.out" }, 1.45)
        .to(q("[data-clouds]"), { opacity: 1, duration: 0.5 }, 1.5)
        .to(q("[data-marble]"), { scale: 1, duration: 3, ease: "sine.out" }, 1.5)
        .to(level, { v: 150, duration: 2.7, ease: "power1.inOut", onUpdate: () => setLevel(level.v) }, 1.5)
        .to(q("[data-ice]"), { y: "-=250", duration: 2.7, ease: "power1.inOut", stagger: 0.05 }, 1.5)
        .to(g, { ...LIQUID.iced, duration: 3, ease: "sine.inOut" }, 1.65)
        .to(q("[data-stream]"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.5 }, 4.1)
        .to(q("[data-droplets]"), { opacity: 1, duration: 2.2 }, 3.9)
        .to(q("[data-annot-line]"), { drawSVG: "100%", duration: 0.9, stagger: 0.15, ease: "power2.inOut" }, 4.2)
        .to(q("[data-annot-label]"), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.15 }, 4.6);

      const ambient = gsap.timeline({ paused: true, repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
      ambient
        .to(q("[data-marble-b]"), { opacity: 0.85, duration: 7 }, 0)
        .to(q("[data-marble]"), { x: -8, y: 6, duration: 7 }, 0)
        .to(q("[data-marble-b]"), { x: 8, y: -4, duration: 7 }, 0)
        .to(q("[data-ice]"), { y: "+=6", rotation: "+=4", duration: 3.5, stagger: 0.4 }, 0);
      const richMotion = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;

      ScrollTrigger.create({ trigger: wrap.current, start: "top 75%", once: true, onEnter: () => tl.play() });
      ScrollTrigger.create({
        trigger: wrap.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          if (self.isActive && richMotion && tl.progress() > 0.95) ambient.play();
          else ambient.pause();
        },
      });
      tl.call(() => richMotion && ambient.play(), [], 4.8);

      return () => ambient.kill();
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <GlassArt
        ref={glass}
        uid={uid}
        level={436}
        iceVisible={false}
        dropletsVisible={false}
        cloudsVisible={false}
        style={LIQUID.espresso as React.CSSProperties}
        className="absolute inset-0 size-full overflow-visible"
        inside={
          <g data-stream>
            <rect data-stream-inner x="203" y="60" width="11" height="376" rx="5.5" fill="#f6ecdf" />
            <ellipse data-splash cx="208" cy="436" rx="6" ry="2" fill="none" stroke="#fbf4ea" strokeWidth="2" opacity="0" />
            <ellipse data-splash cx="208" cy="436" rx="6" ry="2" fill="none" stroke="#fbf4ea" strokeWidth="1.5" opacity="0" />
          </g>
        }
        over={
          <>
            <g data-stream>
              <path d="M201 -420 C201 -200 203 -60 203 60 L214 60 C214 -60 212 -200 212 -420 Z" fill={`url(#${uid}-stream-grad)`} />
              <path d="M205 -420 C205 -200 206 -60 206 60" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" />
              <defs>
                <linearGradient id={`${uid}-stream-grad`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#e8d9c2" />
                  <stop offset="0.4" stopColor="#fbf5ec" />
                  <stop offset="1" stopColor="#dccab0" />
                </linearGradient>
              </defs>
            </g>
            {annotations && (
              <g className="hidden lg:inline" fontSize="11" letterSpacing="3.2" fontWeight="600" style={{ fontFamily: "var(--font-manrope)" }}>
                <path data-annot-line d="M300 210 L350 180 L440 180" stroke="#a8c3cc" strokeWidth="1" />
                <circle data-annot-label cx="300" cy="210" r="3.5" fill="#a8c3cc" />
                <text data-annot-label x="352" y="170" fill="#dbe8ec">COLD MILK</text>
                <path data-annot-line d="M282 466 L340 498 L430 498" stroke="#a8c3cc" strokeWidth="1" />
                <circle data-annot-label cx="282" cy="466" r="3.5" fill="#a8c3cc" />
                <text data-annot-label x="342" y="488" fill="#dbe8ec">ESPRESSO</text>
                <path data-annot-line d="M150 150 L96 120 L20 120" stroke="#a8c3cc" strokeWidth="1" />
                <circle data-annot-label cx="150" cy="150" r="3.5" fill="#a8c3cc" />
                <text data-annot-label x="20" y="110" fill="#dbe8ec">ICE</text>
              </g>
            )}
          </>
        }
      />
    </div>
  );
}
