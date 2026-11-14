"use client";

import { forwardRef } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { DietMark } from "@/components/brand";
import type { MenuItem } from "@/content/menu";
import { menuMeta } from "@/content/menu";
import { formatPrice } from "@/lib/format";

type MenuCardProps = { item: MenuItem; onOpen: () => void; index: number };

export const MenuCard = forwardRef<HTMLLIElement, MenuCardProps>(function MenuCard({ item, onOpen, index }, ref) {
  const price = menuMeta.showPrices ? formatPrice(item.price) : null;
  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="list-none"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="group flex h-full w-full gap-4 rounded-[1.4rem] bg-white/70 p-2.5 text-left ring-1 ring-roast/[0.06] transition-[box-shadow,background-color,transform] duration-500 ease-cinematic hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_-28px_rgb(61_42_31/0.45)] focus-visible:bg-white sm:flex-col sm:gap-0 sm:p-2"
      >
        <div className="relative aspect-square w-[6.75rem] shrink-0 overflow-hidden rounded-[1.05rem] bg-sand sm:aspect-[4/3] sm:w-full">
          <Photo
            src={item.image}
            alt={item.imageAlt}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 108px"
            className="object-cover transition-transform duration-[1400ms] ease-cinematic group-hover:scale-[1.07]"
          />
          {item.bestseller && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-1 text-[0.6rem] font-bold tracking-wider text-espresso uppercase sm:top-3 sm:left-3 sm:px-2.5 sm:text-[0.65rem]">
              <Sparkles className="size-3" /> Bestseller
            </span>
          )}
          <span className="absolute right-3 bottom-3 hidden size-9 translate-y-2 place-items-center rounded-full bg-foam/90 text-roast opacity-0 backdrop-blur transition-all duration-500 ease-cinematic group-hover:translate-y-0 group-hover:opacity-100 sm:grid">
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col py-1 pr-1 sm:px-3 sm:pt-4 sm:pb-3">
          <div className="flex items-start gap-2">
            <h4 className="font-display flex-1 text-[1.15rem] leading-tight font-normal tracking-tight text-roast sm:text-[1.3rem]">
              {item.name}
            </h4>
            <DietMark diet={item.diet} className="mt-1" />
          </div>
          <p className="mt-1.5 line-clamp-2 text-[0.85rem] leading-relaxed text-cocoa/75 sm:mt-2">{item.description}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="truncate text-[0.7rem] font-semibold tracking-[0.14em] text-caramel-deep uppercase">
              {item.tags?.slice(0, 2).join(" · ")}
            </span>
            {price && <span className="font-display shrink-0 text-lg text-roast">{price}</span>}
          </div>
        </div>
      </button>
    </motion.li>
  );
});
