"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Swiper as SwiperType } from "swiper";
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/ui/photo";
import { Tilt } from "@/components/magic/tilt";
import { useProductDialog } from "@/components/menu/product-dialog";
import { getCategory, menuMeta, signatureItems, type MenuItem } from "@/content/menu";
import { signatureCopy } from "@/content/copy";
import { formatPrice } from "@/lib/format";

const ids = signatureItems.map((i) => i.id);

// Swiper is code-split: the server-rendered static row shows instantly and the
// carousel upgrades in place once its chunk arrives.
const SignatureCarousel = dynamic(() => import("./signature-carousel").then((m) => m.SignatureCarousel), {
  ssr: false,
  loading: () => <StaticRow />,
});
export const SLIDE_WIDTH = "w-[78vw] shrink-0 sm:w-[48vw] md:w-[38vw] lg:w-[29vw] xl:w-[25vw] 2xl:w-[22rem]";
export const TRACK_PAD = "px-5 sm:px-6 lg:px-10 xl:px-[max(2.5rem,calc((100vw-90rem)/2+2.5rem))]";


export function Signature() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const { openProduct } = useProductDialog();

  if (signatureItems.length === 0) return null;
  const open = (id: string) => openProduct(id, ids);

  return (
    <section
      id="signature"
      aria-labelledby="signature-title"
      className="grain relative overflow-hidden bg-roast py-28 text-foam md:py-36"
    >
      <div aria-hidden className="pointer-events-none absolute -top-60 -right-40 size-[56rem] rounded-full bg-[radial-gradient(closest-side,rgb(185_130_80/0.09),transparent)]" />
      <p
        aria-hidden
        className="font-display pointer-events-none absolute -bottom-10 left-0 text-[22vw] leading-none font-light tracking-[-0.05em] whitespace-nowrap text-foam/[0.025] select-none"
      >
        Signatures
      </p>

      <div className="relative mx-auto flex max-w-[90rem] flex-col gap-10 px-5 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-10">
        <SectionHeading
          id="signature-title"
          eyebrow={signatureCopy.eyebrow}
          title={signatureCopy.headline}
          accent={["intention."]}
          accentClassName="italic text-gold"
          supporting={signatureCopy.supporting}
          eyebrowClassName="text-gold"
        />
        <Reveal delay={0.2} className="flex items-center gap-3">
          {(["prev", "next"] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => (dir === "prev" ? swiper?.slidePrev() : swiper?.slideNext())}
              disabled={dir === "prev" ? edges.start : edges.end}
              aria-label={dir === "prev" ? "Previous signature drink" : "Next signature drink"}
              className="grid size-14 place-items-center rounded-full border border-foam/20 text-foam transition-all duration-500 ease-cinematic hover:border-gold hover:bg-gold hover:text-espresso disabled:pointer-events-none disabled:opacity-30"
            >
              {dir === "prev" ? <ArrowLeft className="size-5" /> : <ArrowRight className="size-5" />}
            </button>
          ))}
        </Reveal>
      </div>

      <Reveal delay={0.1} y={40} className="relative mt-14 md:mt-16">
        <div data-cursor="Drag" role="region" aria-roledescription="carousel" aria-label="Signature drinks">
          <SignatureCarousel
            onSwiper={setSwiper}
            onProgress={setProgress}
            onEdges={setEdges}
            onOpen={open}
            renderCard={(item, i, onOpen) => <SignatureCard item={item} index={i} onOpen={onOpen} />}
          />
        </div>

        <div className="mx-auto mt-10 flex max-w-[90rem] items-center gap-5 px-5 sm:px-6 lg:px-10">
          <div className="relative h-px flex-1 bg-foam/15" aria-hidden>
            <div
              className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-300"
              style={{ width: `${Math.max(8, Math.min(100, progress * 100))}%` }}
            />
          </div>
          <a href="#menu" className="group inline-flex items-center gap-2 text-sm font-semibold text-gold">
            Full menu
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}

function StaticRow() {
  const { openProduct } = useProductDialog();
  return (
    <ul className={`no-scrollbar flex gap-4 overflow-x-auto md:gap-6 ${TRACK_PAD}`}>
      {signatureItems.map((item, i) => (
        <li key={item.id} className={SLIDE_WIDTH}>
          <SignatureCard item={item} index={i} onOpen={() => openProduct(item.id, ids)} />
        </li>
      ))}
    </ul>
  );
}

function SignatureCard({ item, index, onOpen }: { item: MenuItem; index: number; onOpen: () => void }) {
  const price = menuMeta.showPrices ? formatPrice(item.price) : null;
  return (
    <Tilt className="rounded-[1.75rem]">
      <button
        type="button"
        data-cursor="View"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`${item.name} — view details`}
        className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] bg-mocha text-left ring-1 ring-foam/10"
      >
        <Photo
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes="(min-width: 1536px) 352px, (min-width: 1280px) 25vw, (min-width: 1024px) 29vw, (min-width: 768px) 38vw, 78vw"
          className="object-cover transition-transform duration-[1600ms] ease-cinematic group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-espresso/10 transition-opacity duration-700 group-hover:opacity-90" />

        <div className="absolute inset-x-5 top-5 flex items-start justify-between">
          <span className="rounded-full border border-foam/20 bg-espresso/30 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-foam/90 uppercase backdrop-blur-md">
            {getCategory(item.category)?.name}
          </span>
          <span className="font-display text-sm text-foam/70 italic tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        </div>

        <div className="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
          {item.bestseller && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[0.65rem] font-bold tracking-wider text-espresso uppercase">
              <Sparkles className="size-3" /> Bestseller
            </span>
          )}
          <h3 className="font-display text-[1.9rem] leading-none font-light tracking-tight">{item.name}</h3>
          <p className="mt-3 line-clamp-2 max-w-[28ch] text-sm leading-relaxed text-foam/70 transition-colors duration-500 group-hover:text-foam/90">
            {item.description}
          </p>
          <div className="mt-5 flex items-center justify-between">
            <span className="rounded-full bg-foam/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-gold backdrop-blur-md">
              {price ?? item.tags?.slice(0, 2).join(" · ")}
            </span>
            <span className="grid size-10 place-items-center rounded-full bg-foam text-espresso transition-transform duration-500 ease-cinematic group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </button>
    </Tilt>
  );
}
