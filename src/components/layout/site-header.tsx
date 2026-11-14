"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu as MenuIcon, X } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { navigation, site } from "@/content/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const lastY = useRef(0);
  const { setLocked } = useSmoothScroll();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Solid background after leaving the hero; hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let isHidden = false;
    let published = "";
    const root = document.documentElement;
    // Writing a CSS variable on <html> restyles the whole page, so only do it
    // when the value actually changes (not on every scroll event).
    const publishOffset = () => {
      const h = headerRef.current?.offsetHeight ?? 64;
      const value = isHidden ? "0px" : `${h}px`;
      if (value === published) return;
      published = value;
      root.style.setProperty("--header-offset", value);
    };
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > 480 && y > lastY.current + 4) isHidden = true;
      else if (y < lastY.current - 4 || y <= 480) isHidden = false;
      setHidden(isHidden);
      publishOffset();
      lastY.current = y;
    };
    const onResize = () => {
      published = "";
      publishOffset();
    };
    window.addEventListener("resize", onResize);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Highlight the section currently in view.
  useEffect(() => {
    const ids = navigation.map((n) => n.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setLocked(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setLocked]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] rounded-full bg-foam px-4 py-2 text-sm font-semibold text-espresso focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,backdrop-filter,border-color] duration-500 ease-cinematic",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
          scrolled || open
            ? "border-b border-foam/8 bg-espresso/85 backdrop-blur-md lg:bg-espresso/75 lg:backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-6 px-4 text-foam sm:px-6 md:h-20 lg:px-10"
        >
          <a href="#top" className="relative z-[60] rounded-md" onClick={() => setOpen(false)}>
            <Wordmark />
            <span className="sr-only">, back to top</span>
          </a>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {navigation.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group relative rounded-full px-3.5 py-2 text-[0.8rem] font-medium tracking-wide transition-colors duration-300",
                      isActive ? "text-gold" : "text-foam/75 hover:text-foam",
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute inset-x-3.5 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-500 ease-cinematic",
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#feedback"
              className="hidden items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-[0.8rem] font-semibold tracking-wide text-gold transition-all duration-500 ease-cinematic hover:border-gold hover:bg-gold hover:text-espresso sm:inline-flex"
            >
              Share Feedback
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative z-[60] grid size-11 place-items-center rounded-full border border-foam/15 text-foam transition-colors hover:border-foam/40 xl:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[45] flex flex-col overflow-y-auto bg-espresso px-6 pt-28 pb-10 text-foam xl:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            transition={{ duration: 0.7, ease: EASE }}
            data-lenis-prevent
          >
            <div className="pointer-events-none absolute -right-32 -bottom-16 size-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(185_130_80/0.16),transparent)]" />
            <ul className="relative flex flex-col gap-1">
              {navigation.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-2 font-display text-[2.2rem] leading-none font-light"
                  >
                    <span className="w-7 font-sans text-xs font-semibold tracking-widest text-gold/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="relative mt-auto flex flex-col gap-3 pt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <a
                href="#feedback"
                onClick={() => setOpen(false)}
                className="flex h-14 items-center justify-center rounded-full bg-gold font-semibold text-espresso"
              >
                Share Your Experience
              </a>
              <a
                href={site.googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-2 rounded-full border border-foam/20 text-sm font-medium text-foam/85"
              >
                Find us on Google <ArrowUpRight className="size-4" />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
