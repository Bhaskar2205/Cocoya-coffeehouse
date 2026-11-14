"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Custom cursor: a crisp dot plus a soft trailing ring that swells over
 * interactive elements. Add `data-cursor="View"` to show a label.
 * Only on fine pointers without reduced motion; the native cursor remains
 * available to assistive tech (we only hide it visually via CSS class).
 */
export function MagicCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    const raf = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    document.documentElement.classList.add("has-magic-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });
    let current: Element | null = null;
    let seen = false;
    gsap.set([dot.current, ring.current], { opacity: 0 });

    const onMove = (e: PointerEvent) => {
      if (!seen) {
        seen = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.4 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const target = (e.target as Element | null)?.closest("[data-cursor], a, button, input, select, textarea, label, [role='button']") ?? null;
      if (target === current) return;
      current = target;
      const text = target?.getAttribute("data-cursor") ?? "";
      const isField = !!target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      setLabel(text);
      gsap.to(ring.current, {
        scale: text ? 2.9 : target && !isField ? 1.7 : 1,
        opacity: isField ? 0 : 1,
        backgroundColor: text ? "rgba(214,178,122,0.95)" : "rgba(214,178,122,0)",
        borderColor: text ? "rgba(214,178,122,0)" : "rgba(214,178,122,0.65)",
        duration: 0.45,
        ease: "power3.out",
      });
      gsap.to(dot.current, { scale: target ? 0 : 1, duration: 0.3 });
    };
    const onDown = () => gsap.to(ring.current, { scale: "*=0.82", duration: 0.15, yoyo: true, repeat: 1 });
    const onLeaveWindow = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 });
    const onEnterWindow = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeaveWindow);
    document.addEventListener("pointerenter", onEnterWindow);
    return () => {
      document.documentElement.classList.remove("has-magic-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeaveWindow);
      document.removeEventListener("pointerenter", onEnterWindow);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={ring}
        className="absolute top-0 left-0 -mt-5 -ml-5 grid size-10 place-items-center rounded-full border border-gold/60 mix-blend-normal"
      >
        <span className="text-[0.32rem] font-bold tracking-[0.2em] text-espresso uppercase">{label}</span>
      </div>
      <div ref={dot} className="absolute top-0 left-0 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-gold" />
    </div>
  );
}
