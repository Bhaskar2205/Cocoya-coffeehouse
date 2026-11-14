"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

type Initial = { rating?: number; status?: string; q?: string };

const selectClass =
  "h-11 cursor-pointer appearance-none rounded-xl border border-border bg-card px-4 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23b8a48f%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[position:right_0.9rem_center] bg-no-repeat";

export function ReviewFiltersBar({ initial }: { initial: Initial }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(initial.q ?? "");
  const [rating, setRating] = useState(initial.rating ? String(initial.rating) : "all");
  const [status, setStatus] = useState(initial.status ?? "all");
  const first = useRef(true);

  const apply = (next: { q?: string; rating?: string; status?: string }) => {
    const p = new URLSearchParams();
    const v = { q, rating, status, ...next };
    if (v.q?.trim()) p.set("q", v.q.trim());
    if (v.rating && v.rating !== "all") p.set("rating", v.rating);
    if (v.status && v.status !== "all") p.set("status", v.status);
    const s = p.toString();
    startTransition(() => router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false }));
  };

  // Debounced name search.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => apply({ q }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = q || rating !== "all" || status !== "all";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/50 p-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <label htmlFor="review-search" className="sr-only">
          Search by customer name
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="review-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by customer name"
          maxLength={80}
          className="h-11 w-full rounded-xl border border-border bg-card pr-10 pl-10 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        {pending && <Loader2 className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex">
        <label className="sr-only" htmlFor="rating-filter">
          Filter by rating
        </label>
        <select
          id="rating-filter"
          value={rating}
          onChange={(e) => {
            setRating(e.target.value);
            apply({ rating: e.target.value });
          }}
          className={selectClass}
        >
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} {n} star{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="status-filter">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            apply({ status: e.target.value });
          }}
          className={selectClass}
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      {active && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            setRating("all");
            setStatus("all");
            apply({ q: "", rating: "all", status: "all" });
          }}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" /> Clear
        </button>
      )}
    </div>
  );
}
