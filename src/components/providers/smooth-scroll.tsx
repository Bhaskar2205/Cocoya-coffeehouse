"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionConfig } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

type ScrollContextValue = {
  /** Smoothly scroll to a section id ("menu"), an element, or the top (0). */
  scrollTo: (target: string | HTMLElement | number) => void;
  /** Pause/resume page scrolling (used by overlays such as the mobile menu). */
  setLocked: (locked: boolean) => void;
};

const ScrollContext = createContext<ScrollContextValue>({
  scrollTo: () => {},
  setLocked: () => {},
});

export const useSmoothScroll = () => useContext(ScrollContext);

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Native momentum on touch devices feels best and is lightest on mobile.
      syncTouch: false,
    });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = instance;

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: string | HTMLElement | number) => {
    let el: HTMLElement | null = null;
    if (typeof target === "string") {
      el = target === "top" || target === "" ? null : document.getElementById(target);
      if (!el && target !== "top" && target !== "") return;
    } else if (target instanceof HTMLElement) {
      el = target;
    }

    const instance = lenisRef.current;
    if (instance) {
      instance.scrollTo(el ?? (typeof target === "number" ? target : 0), {
        duration: 1.4,
        // Sections using content-visibility may render (and change height)
        // mid-scroll; nudge to the exact destination if we landed short.
        onComplete: () => {
          if (el && Math.abs(el.getBoundingClientRect().top) > 4) instance.scrollTo(el, { duration: 0.6 });
        },
      });
    } else if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    } else {
      window.scrollTo({ top: typeof target === "number" ? target : 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }

    // Move keyboard / screen-reader focus to the destination section.
    if (el) {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
  }, []);

  const setLocked = useCallback((locked: boolean) => {
    const instance = lenisRef.current;
    if (locked) {
      instance?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      instance?.start();
      document.documentElement.style.overflow = "";
    }
  }, []);

  // Off-screen sections render lazily (content-visibility), so the page height
  // settles as you scroll — keep pinned/scrubbed animations measured correctly.
  useEffect(() => {
    let last = document.documentElement.scrollHeight;
    let timer = 0;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - last) < 2) return;
      last = h;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Route every in-page "#anchor" link through the smooth scroller.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href")!.slice(1);
      if (id && id !== "top" && !document.getElementById(id)) return;
      event.preventDefault();
      scrollTo(id || "top");
      history.replaceState(null, "", id && id !== "top" ? `#${id}` : window.location.pathname);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);


  const value = useMemo(() => ({ scrollTo, setLocked }), [scrollTo, setLocked]);

  return (
    <ScrollContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ScrollContext.Provider>
  );
}
