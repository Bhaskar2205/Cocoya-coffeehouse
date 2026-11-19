import { Suspense } from "react";
import { Stars } from "@/components/brand";
import { getFeaturedFeedback } from "@/lib/featured-feedback";
import { formatDateIST } from "@/lib/format";

const SHOWN = 3;

/**
 * "Latest from our guests" strip shown directly above the feedback form.
 * Lists the newest consented guest comments (they go live on submit; the owner
 * can hide any in /admin/reviews). Renders nothing until there is at least one.
 */
async function RecentFeedbackList() {
  const items = (await getFeaturedFeedback()).slice(0, SHOWN);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recent-feedback-title" className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex size-2" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-caramel opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-caramel" />
        </span>
        <h3 id="recent-feedback-title" className="text-xs font-semibold tracking-[0.2em] text-cocoa/75 uppercase">
          Latest from our guests
        </h3>
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((f) => (
          <li key={f.id}>
            <figure className="rounded-2xl bg-white p-5 shadow-[0_20px_60px_-40px_rgb(61_42_31/0.5)] ring-1 ring-roast/[0.06]">
              <div className="flex items-center justify-between gap-3">
                <Stars rating={f.rating} className="text-roast" />
                <time dateTime={f.date} className="text-xs text-cocoa/60">
                  {formatDateIST(f.date)}
                </time>
              </div>
              <blockquote className="mt-3 line-clamp-4 text-[0.95rem] leading-relaxed text-pretty text-roast">
                “{f.text}”
              </blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-cocoa">{f.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RecentFeedback() {
  return (
    <Suspense fallback={null}>
      <RecentFeedbackList />
    </Suspense>
  );
}
