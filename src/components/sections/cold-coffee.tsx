"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Snowflake } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { ImageReveal, Reveal } from "@/components/motion/reveal";
import { LivingGlass } from "@/components/art/living-glass";
import { useProductDialog } from "@/components/menu/product-dialog";
import { coldFeatureItems, menuMeta, type MenuItem } from "@/content/menu";
import { coldCopy } from "@/content/copy";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = [0.22, 1, 0.36, 1] as const;
const ids = coldFeatureItems.map((i) => i.id);

export function ColdCoffee() {
  const root = useRef<HTMLElement>(null);
  const showcase = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { openProduct } = useProductDialog();
  const n = coldFeatureItems.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const texts = gsap.utils.toArray<HTMLElement>("[data-cold-text]");
        const images = gsap.utils.toArray<HTMLElement>("[data-cold-image]");
        const inners = gsap.utils.toArray<HTMLElement>("[data-cold-inner]");

        gsap.set(texts.slice(1), { autoAlpha: 0, y: 40 });
        gsap.set(images.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: showcase.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => setActive(Math.min(n - 1, Math.floor(self.progress * n * 0.999))),
          },
        });

        for (let i = 1; i < n; i++) {
          const at = i - 1 + 0.35;
          tl.to(texts[i - 1]!, { autoAlpha: 0, y: -40, duration: 0.35, ease: "power1.in" }, at)
            .to(images[i]!, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" }, at)
            .fromTo(inners[i]!, { scale: 1.28 }, { scale: 1, duration: 0.9, ease: "power2.out" }, at)
            .to(inners[i - 1]!, { scale: 0.92, duration: 0.7 }, at)
            .to(texts[i]!, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power1.out" }, at + 0.4);
        }
        tl.to({}, { duration: 0.4 });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  if (n === 0) return null;

  return (
    <section id="cold" ref={root} aria-labelledby="cold-title" className="relative bg-glacier text-ice">
      {/* ── Cinematic intro: the living glass ─────────────────────────────── */}
      <div data-cold-intro className="grain relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_60%_at_70%_45%,rgb(168_195_204/0.16),transparent_70%)] max-lg:bg-[radial-gradient(80%_45%_at_50%_30%,rgb(168_195_204/0.16),transparent_70%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-glacier to-transparent" />

        {/* Drifting frost */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[
            "left-[12%] top-[22%] size-2",
            "left-[68%] top-[30%] size-1.5",
            "left-[82%] top-[62%] size-2.5",
            "left-[38%] top-[14%] size-1",
            "left-[54%] top-[72%] size-1.5",
          ].map((pos, i) => (
            <motion.span
              key={pos}
              className={cn("absolute rounded-full bg-ice/70 blur-[1px]", pos)}
              animate={{ y: [0, -24, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid min-h-[100svh] w-full max-w-[90rem] items-center gap-4 px-5 py-24 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-28">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <Reveal y={12}>
              <p className="eyebrow text-frost">
                <Snowflake className="size-3.5" aria-hidden /> {coldCopy.eyebrow}
              </p>
            </Reveal>
            <h2 id="cold-title" className="font-display mt-6 text-[clamp(3rem,1.5rem+5.4vw,7.4rem)] leading-[0.92] font-light tracking-[-0.035em] text-foam">
              <span className="sr-only">{coldCopy.headline}</span>
              <motion.span
                aria-hidden
                className="block"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
              >
                {coldCopy.headline.split(" ").map((word, i, arr) => (
                  <span key={word} className="block overflow-hidden pb-[0.08em]">
                    <motion.span
                      className={cn(
                        "block",
                        i === 1 && "pl-[6vw] lg:pl-[4vw]",
                        i === arr.length - 1 &&
                          "font-display-wonk bg-gradient-to-r from-ice via-frost to-ice bg-clip-text pl-[2vw] text-transparent italic",
                      )}
                      variants={{
                        hidden: { y: "105%" },
                        visible: { y: "0%", transition: { duration: 1.1, delay: i * 0.14, ease: EASE } },
                      }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </motion.span>
            </h2>
            <Reveal delay={0.4} className="mt-8 max-w-lg">
              <p className="text-base leading-relaxed text-pretty text-ice/80 md:text-lg">{coldCopy.supporting}</p>
            </Reveal>
          </div>
          <LivingGlass uid="cold-glass" className="order-1 h-[46svh] min-h-[300px] lg:order-2 lg:col-span-6 lg:h-[78vh]" />
        </div>
      </div>

      {/* ── Desktop: pinned scroll showcase ───────────────────────────────── */}
      <div
        ref={showcase}
        className="relative hidden lg:block motion-reduce:!hidden"
        style={{ height: `${n * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/4 size-[46rem] -translate-x-1/4 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(168_195_204/0.08),transparent)]" />
          <div className="relative mx-auto grid w-full max-w-[90rem] grid-cols-12 items-center gap-10 px-10">
            <div className="relative col-span-5 h-[30rem]">
              {coldFeatureItems.map((item, i) => (
                <ColdText
                  key={item.id}
                  item={item}
                  index={i}
                  total={n}
                  data-cold-text=""
                  className={cn("absolute inset-0 flex flex-col justify-center", i > 0 && "invisible opacity-0")}
                  onOpen={() => openProduct(item.id, ids)}
                />
              ))}
            </div>

            <div className="relative col-span-6 col-start-7 mx-auto aspect-[4/5] h-[min(80vh,46rem)] overflow-hidden rounded-[2.25rem] ring-1 ring-ice/10">
              {coldFeatureItems.map((item, i) => (
                <div
                  key={item.id}
                  data-cold-image=""
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)", zIndex: i }}
                >
                  <div data-cold-inner="" className="absolute inset-0">
                    <Photo src={item.image} alt={item.imageAlt} fill sizes="(min-width: 1024px) 40vw, 1px" quality={85} className="object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-glacier/50 via-transparent to-transparent" />
                </div>
              ))}
              <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2 rounded-full border border-ice/20 bg-glacier/40 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-ice uppercase backdrop-blur-md">
                <Snowflake className="size-3.5" aria-hidden /> Served chilled
              </div>
            </div>

            <div className="col-span-1 flex flex-col items-center gap-3" aria-hidden>
              {coldFeatureItems.map((item, i) => (
                <span
                  key={item.id}
                  className={cn(
                    "w-px rounded-full transition-all duration-500",
                    i === active ? "h-12 bg-frost" : "h-6 bg-ice/20",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile / reduced motion: stacked showcase ─────────────────────── */}
      <div className="mx-auto flex max-w-2xl flex-col gap-16 px-5 py-20 sm:px-6 lg:hidden lg:motion-reduce:flex lg:max-w-[90rem] lg:grid-cols-2">
        {coldFeatureItems.map((item, i) => (
          <article key={item.id} className="flex flex-col gap-6">
            <ImageReveal className="aspect-[4/5] rounded-[1.75rem] ring-1 ring-ice/10">
              <Photo src={item.image} alt={item.imageAlt} fill sizes="(min-width: 672px) 672px, 100vw" className="object-cover" />
            </ImageReveal>
            <Reveal>
              <ColdText item={item} index={i} total={n} onOpen={() => openProduct(item.id, ids)} />
            </Reveal>
          </article>
        ))}
      </div>
    </section>
  );
}

function ColdText({
  item,
  index,
  total,
  onOpen,
  className,
  ...rest
}: {
  item: MenuItem;
  index: number;
  total: number;
  onOpen: () => void;
  className?: string;
  "data-cold-text"?: string;
}) {
  const price = menuMeta.showPrices ? formatPrice(item.price) : null;
  return (
    <div className={className} {...rest}>
      <p className="font-display text-sm text-frost italic tabular-nums">
        {String(index + 1).padStart(2, "0")} <span className="text-ice/60">/ {String(total).padStart(2, "0")}</span>
      </p>
      <h3 className="font-display mt-4 text-[2.6rem] leading-[0.95] font-light tracking-tight text-foam sm:text-6xl xl:text-7xl">
        {item.name}
      </h3>
      <p className="mt-5 max-w-md text-base leading-relaxed text-pretty text-ice/75 md:text-lg">{item.description}</p>
      {item.tags && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-ice/20 px-3.5 py-1.5 text-xs font-medium text-ice/85">
              {tag}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 flex items-center gap-5">
        {price && <span className="font-display text-2xl text-foam">{price}</span>}
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          className="group inline-flex h-12 items-center gap-2 rounded-full bg-ice px-5 text-sm font-semibold text-glacier transition-all duration-500 ease-cinematic hover:bg-foam"
        >
          View details
          <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
        </button>
      </div>
    </div>
  );
}
