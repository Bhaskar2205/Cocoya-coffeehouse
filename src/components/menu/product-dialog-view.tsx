"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Info, Sparkles, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Photo } from "@/components/ui/photo";
import { DietMark } from "@/components/brand";
import { getCategory, menuMeta, type MenuItem } from "@/content/menu";
import { formatPrice } from "@/lib/format";

type ViewProps = {
  open: boolean;
  item?: MenuItem;
  index: number;
  total: number;
  direction: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

/** Product detail dialog (code-split: loaded the first time a product is opened). */
export function ProductDialogView({ open, item, index, total, direction, onClose, onPrev, onNext }: ViewProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        data-lenis-prevent
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onNext();
          if (e.key === "ArrowLeft") onPrev();
        }}
        className="max-h-[92svh] max-w-[calc(100%-1.5rem)] gap-0 overflow-y-auto rounded-[1.75rem] border-0 bg-foam p-0 text-roast ring-1 ring-roast/10 sm:max-w-4xl md:overflow-hidden"
      >
        {item && <ProductView item={item} index={index} total={total} direction={direction} onPrev={onPrev} onNext={onNext} />}
      </DialogContent>
    </Dialog>
  );
}

function ProductView({
  item,
  index,
  total,
  direction,
  onPrev,
  onNext,
}: {
  item: MenuItem;
  index: number;
  total: number;
  direction: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const price = menuMeta.showPrices ? formatPrice(item.price) : null;
  const category = getCategory(item.category);

  return (
    <div className="grid md:grid-cols-[1.05fr_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden bg-mocha md:aspect-auto md:min-h-[34rem]">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={item.id}
            className="absolute inset-0"
            custom={direction}
            initial={{ opacity: 0, scale: 1.08, x: direction * 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Photo src={item.image} alt={item.imageAlt} fill quality={85} sizes="(min-width: 768px) 460px, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/50 via-transparent to-transparent" />
        {item.bestseller && (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[0.7rem] font-bold tracking-wider text-espresso uppercase">
            <Sparkles className="size-3.5" /> Bestseller
          </span>
        )}
        {total > 1 && (
          <div className="absolute right-4 bottom-4 flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous item"
              className="grid size-10 place-items-center rounded-full bg-foam/90 text-roast backdrop-blur transition hover:bg-foam"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="rounded-full bg-espresso/60 px-3 py-1.5 text-xs font-semibold text-foam tabular-nums backdrop-blur">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next item"
              className="grid size-10 place-items-center rounded-full bg-foam/90 text-roast backdrop-blur transition hover:bg-foam"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      <div className="relative flex flex-col p-6 sm:p-8 md:max-h-[92svh] md:overflow-y-auto md:p-10" data-lenis-prevent>
        <DialogClose
          aria-label="Close"
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-full border border-roast/10 text-roast/70 transition hover:border-roast/30 hover:text-roast"
        >
          <X className="size-4" />
        </DialogClose>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            <p className="eyebrow pr-12 text-caramel-deep">{category?.name}</p>
            <DialogTitle className="font-display mt-4 text-[2.25rem] leading-[1.05] font-light tracking-tight sm:text-[2.6rem]">
              {item.name}
            </DialogTitle>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <DietMark diet={item.diet} />
              {item.tags?.map((tag) => (
                <span key={tag} className="rounded-full bg-sand/70 px-3 py-1 text-xs font-medium text-cocoa">
                  {tag}
                </span>
              ))}
            </div>

            <DialogDescription className="mt-6 text-[1.02rem] leading-relaxed text-cocoa/90">{item.description}</DialogDescription>
            {item.details && <p className="mt-3 text-[0.95rem] leading-relaxed text-cocoa/75">{item.details}</p>}

            <div className="mt-auto pt-8">
              {(price || item.serving) && (
                <div className="flex items-end justify-between gap-4 border-t border-roast/10 pt-6">
                  {price && <p className="font-display text-3xl text-roast">{price}</p>}
                  {item.serving && <p className="text-sm text-cocoa/70">{item.serving}</p>}
                </div>
              )}
              {menuMeta.status === "sample" && (
                <p className="mt-5 flex gap-2 rounded-2xl bg-sand/50 p-3.5 text-[0.8rem] leading-relaxed text-cocoa/80">
                  <Info className="mt-0.5 size-4 shrink-0 text-caramel-deep" />
                  Our menu is still being finalised — please ask our team about today&apos;s offerings.
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
