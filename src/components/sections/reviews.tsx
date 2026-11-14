import { Suspense } from "react";
import { ArrowDown, ArrowUpRight, Quote } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Stars } from "@/components/brand";
import { googleRating, googleReviews } from "@/content/reviews";
import { reviewsCopy } from "@/content/copy";
import { site } from "@/content/site";
import { getFeaturedFeedback } from "@/lib/featured-feedback";
import { formatDateIST } from "@/lib/format";

type DisplayReview = { key: string; author: string; rating: number; text: string; date: string; source: "Google" | "Guest feedback" };

function ReviewCard({ review, index }: { review: DisplayReview; index: number }) {
  const isoDate = /^\d{4}-\d{2}-\d{2}/.test(review.date);
  return (
    <Reveal delay={(index % 3) * 0.1} className="h-full">
      <figure className="flex h-full flex-col rounded-[1.75rem] border border-foam/10 bg-foam/[0.035] p-7 backdrop-blur-sm md:p-8">
        <div className="flex items-center justify-between">
          <Stars rating={review.rating} />
          <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-foam/60 uppercase">{review.source}</span>
        </div>
        <blockquote className="font-display mt-6 flex-1 text-[1.2rem] leading-relaxed font-light text-pretty text-foam/90">
          “{review.text}”
        </blockquote>
        <figcaption className="mt-8 flex items-center justify-between border-t border-foam/10 pt-5 text-sm">
          <span className="font-semibold text-foam">{review.author}</span>
          <span className="text-foam/50">{isoDate ? formatDateIST(review.date) : review.date}</span>
        </figcaption>
      </figure>
    </Reveal>
  );
}

async function ReviewList() {
  const featured = await getFeaturedFeedback();
  const reviews: DisplayReview[] = [
    ...googleReviews.map((r, i) => ({ key: `g-${i}`, author: r.author, rating: r.rating, text: r.text, date: r.date, source: "Google" as const })),
    ...featured.map((f) => ({ key: f.id, author: f.name, rating: f.rating, text: f.text, date: f.date, source: "Guest feedback" as const })),
  ];

  if (reviews.length === 0) {
    return (
      <Reveal className="mx-auto max-w-2xl text-center">
        <Quote className="mx-auto size-12 text-gold/60" strokeWidth={1} aria-hidden />
        <p className="font-display mt-6 text-2xl leading-snug font-light text-pretty text-foam/85 md:text-3xl">
          {googleRating
            ? `Rated ${googleRating.rating.toFixed(1)} out of 5 by ${googleRating.count.toLocaleString("en-IN")} guests on Google. Read what they're saying about their visits.`
            : "We're gathering our first guest stories. Reviews from Google and featured guest feedback will appear here."}
        </p>
        <a
          href={site.googleProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex items-center gap-2 rounded-full border border-foam/20 px-6 py-3 text-sm font-semibold text-foam transition-all duration-500 ease-cinematic hover:border-gold hover:text-gold"
        >
          Read our reviews on Google
          <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
        </a>
      </Reveal>
    );
  }

  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review, i) => (
        <li key={review.key}>
          <ReviewCard review={review} index={i} />
        </li>
      ))}
    </ul>
  );
}

function ReviewListSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-64 animate-pulse rounded-[1.75rem] border border-foam/10 bg-foam/[0.03]" />
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="cv-auto grain relative overflow-hidden bg-mocha text-foam [--cv-size:1500px]">
      <div aria-hidden className="pointer-events-none absolute -bottom-60 -left-40 size-[50rem] rounded-full bg-[radial-gradient(closest-side,rgb(185_130_80/0.12),transparent)]" />
      <div className="relative mx-auto max-w-[90rem] px-5 py-28 sm:px-6 md:py-36 lg:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="reviews-title"
            eyebrow={reviewsCopy.eyebrow}
            title={reviewsCopy.headline}
            accent={["tables."]}
            accentClassName="italic text-gold"
            eyebrowClassName="text-gold"
          />
          {googleRating && (
            <Reveal delay={0.2} className="flex items-center gap-5">
              <span className="font-display text-7xl font-light text-foam">{googleRating.rating.toFixed(1)}</span>
              <span className="flex flex-col gap-2">
                <Stars rating={googleRating.rating} size="size-5" />
                <a
                  href={site.googleProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foam/65 underline-offset-4 hover:text-gold hover:underline"
                >
                  {googleRating.count.toLocaleString("en-IN")} Google reviews
                </a>
              </span>
            </Reveal>
          )}
        </div>

        <div className="mt-14 md:mt-20">
          <Suspense fallback={<ReviewListSkeleton />}>
            <ReviewList />
          </Suspense>
        </div>

        {/* CTA */}
        <Reveal className="relative mt-20 overflow-hidden rounded-[2rem] bg-gradient-to-br from-caramel via-[#a06c3f] to-cocoa p-8 text-foam sm:p-12 md:mt-28 md:flex md:items-center md:justify-between md:gap-10 md:p-16">
          <div aria-hidden className="pointer-events-none absolute -top-40 -right-32 size-[26rem] rounded-full bg-[radial-gradient(closest-side,rgb(214_178_122/0.35),transparent)]" />
          <div className="relative max-w-xl">
            <h3 className="font-display text-[2.4rem] leading-[1.02] font-light tracking-tight md:text-6xl">{reviewsCopy.ctaHeadline}</h3>
            <p className="mt-4 text-base leading-relaxed text-foam/85 md:text-lg">{reviewsCopy.ctaText}</p>
          </div>
          <a
            href="#feedback"
            className="group relative mt-8 inline-flex h-14 shrink-0 items-center gap-3 rounded-full bg-espresso px-8 font-semibold text-foam shadow-[0_20px_50px_-20px_rgb(13_8_6/0.8)] transition-all duration-500 ease-cinematic hover:bg-foam hover:text-espresso md:mt-0"
          >
            {reviewsCopy.ctaLabel}
            <ArrowDown className="size-4 transition-transform duration-500 group-hover:translate-y-0.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
