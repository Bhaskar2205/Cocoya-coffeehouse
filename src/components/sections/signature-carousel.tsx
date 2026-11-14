"use client";

import type { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Keyboard, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import { signatureItems, type MenuItem } from "@/content/menu";

// Swiper's own (unlayered) CSS sets slide width, so these need !important —
// written out literally so Tailwind generates them.
const SWIPER_PAD = "!px-5 sm:!px-6 lg:!px-10 xl:!px-[max(2.5rem,calc((100vw-90rem)/2+2.5rem))]";
const SWIPER_SLIDE = "!w-[78vw] sm:!w-[48vw] md:!w-[38vw] lg:!w-[29vw] xl:!w-[25vw] 2xl:!w-[22rem]";

type Props = {
  onSwiper: (s: SwiperType) => void;
  onProgress: (p: number) => void;
  onEdges: (e: { start: boolean; end: boolean }) => void;
  onOpen: (id: string) => void;
  renderCard: (item: MenuItem, index: number, onOpen: () => void) => ReactNode;
};

/** The interactive Swiper carousel (code-split; loaded after hydration). */
export function SignatureCarousel({ onSwiper, onProgress, onEdges, onOpen, renderCard }: Props) {
  return (
    <Swiper
      modules={[FreeMode, Keyboard, Mousewheel]}
      onSwiper={onSwiper}
      onProgress={(_, p) => onProgress(p)}
      onSlideChange={(s) => onEdges({ start: s.isBeginning, end: s.isEnd })}
      onReachEnd={(s) => onEdges({ start: s.isBeginning, end: true })}
      onReachBeginning={(s) => onEdges({ start: true, end: s.isEnd })}
      onFromEdge={(s) => onEdges({ start: s.isBeginning, end: s.isEnd })}
      slidesPerView="auto"
      spaceBetween={16}
      freeMode={{ enabled: true, sticky: false, momentumRatio: 0.6 }}
      mousewheel={{ forceToAxis: true, sensitivity: 0.6 }}
      keyboard={{ enabled: true, onlyInViewport: true }}
      grabCursor
      breakpoints={{ 768: { spaceBetween: 24 } }}
      className={`!overflow-visible ${SWIPER_PAD}`}
    >
      {signatureItems.map((item, i) => (
        <SwiperSlide
          key={item.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${signatureItems.length}`}
          className={SWIPER_SLIDE}
        >
          {renderCard(item, i, () => onOpen(item.id))}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
