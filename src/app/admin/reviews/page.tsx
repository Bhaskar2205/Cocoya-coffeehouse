import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, LogOut, MessageSquareText, Star, ThumbsUp, Inbox, Sparkles } from "lucide-react";
import { Wordmark, Stars } from "@/components/brand";
import { requireAdmin } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { PAGE_SIZE, parseFilters, reviewsQuery, type ReviewFilters, type ReviewRow, type ReviewStats } from "@/lib/admin/reviews";
import { EXPERIENCE_OPTIONS } from "@/lib/feedback/schema";
import { formatDateTimeIST } from "@/lib/format";
import { signOut } from "../actions";
import { ReviewFiltersBar } from "./review-filters";
import { StatusSelect } from "./status-select";
import { FeatureToggle } from "./feature-toggle";
import { ExpandableText } from "./expandable-text";

export const metadata: Metadata = { title: "Guest feedback" };

export default function ReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

const experienceLabel = new Map<string, string>(EXPERIENCE_OPTIONS.map((o) => [o.value, o.label]));
const recommendLabel = { yes: "Yes", maybe: "Maybe", no: "No" } as const;

function buildQuery(filters: ReviewFilters, overrides: Partial<ReviewFilters> = {}) {
  const f = { ...filters, ...overrides };
  const p = new URLSearchParams();
  if (f.rating) p.set("rating", String(f.rating));
  if (f.status) p.set("status", f.status);
  if (f.q) p.set("q", f.q);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin/reviews">["searchParams"] }) {
  const filters = parseFilters(await searchParams);
  const admin = await requireAdmin();
  const supabase = (await createSessionClient())!;

  const [statsRes, listRes] = await Promise.all([
    supabase.rpc("review_stats").single<ReviewStats>(),
    reviewsQuery(supabase, filters, { paginate: true }),
  ]);

  const stats: ReviewStats = statsRes.data ?? { total_reviews: 0, average_rating: 0, five_star: 0, new_reviews: 0, would_recommend: 0 };
  const rows = (listRes.data ?? []) as ReviewRow[];
  const total = listRes.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const loadError = statsRes.error || listRes.error;
  const exportHref = `/api/admin/reviews/export${buildQuery({ ...filters, page: 1 })}`;
  const recommendPct = stats.total_reviews ? Math.round((Number(stats.would_recommend) / Number(stats.total_reviews)) * 100) : 0;

  const statCards = [
    { label: "Total reviews", value: Number(stats.total_reviews).toLocaleString("en-IN"), icon: MessageSquareText },
    {
      label: "Average rating",
      value: Number(stats.average_rating).toFixed(2),
      icon: Star,
      extra: <Stars rating={Number(stats.average_rating)} size="size-3.5" />,
    },
    { label: "Five-star reviews", value: Number(stats.five_star).toLocaleString("en-IN"), icon: Sparkles },
    { label: "Awaiting review", value: Number(stats.new_reviews).toLocaleString("en-IN"), icon: Inbox },
    { label: "Would recommend", value: `${recommendPct}%`, icon: ThumbsUp },
  ];

  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-20 sm:px-6 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="View website">
            <Wordmark compact className="text-foam" />
          </Link>
          <span className="hidden h-6 w-px bg-border sm:block" />
          <span className="hidden text-sm text-muted-foreground sm:block">Guest feedback</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[16rem] truncate text-sm text-muted-foreground md:block">{admin.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition hover:bg-muted"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-4 pt-10">
        <div>
          <h1 className="font-display text-4xl font-light tracking-tight sm:text-5xl">Guest feedback</h1>
          <p className="mt-2 text-sm text-muted-foreground">All times shown in IST. Phone numbers are visible to administrators only.</p>
        </div>
        <a
          href={exportHref}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Download className="size-4" /> Export CSV
        </a>
      </div>

      {loadError && (
        <p role="alert" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Couldn&apos;t load feedback. Check that the database migration has been applied. ({loadError.message})
        </p>
      )}

      <section aria-label="Summary" className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, extra }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold tracking-wider uppercase">{label}</span>
              <Icon className="size-4 text-primary" aria-hidden />
            </div>
            <p className="font-display mt-3 text-3xl font-light tabular-nums">{value}</p>
            {extra && <div className="mt-1.5">{extra}</div>}
          </div>
        ))}
      </section>

      <div className="mt-10">
        <ReviewFiltersBar initial={{ rating: filters.rating, status: filters.status, q: filters.q }} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {total.toLocaleString("en-IN")} {total === 1 ? "submission" : "submissions"}
        {filters.rating || filters.status || filters.q ? " match your filters" : ""}
      </p>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center">
          <Inbox className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No feedback found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters.rating || filters.status || filters.q ? "Try clearing the filters." : "New submissions will appear here automatically."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Received</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Guest</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Rating</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Feedback</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Recommend</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top transition-colors hover:bg-muted/30">
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{formatDateTimeIST(r.created_at)}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{r.customer_name}</p>
                      <a href={`tel:${r.country_code}${r.mobile_number}`} className="text-muted-foreground tabular-nums hover:text-primary">
                        {r.country_code} {r.mobile_number}
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <Stars rating={r.rating} size="size-3.5" />
                    </td>
                    <td className="max-w-md px-4 py-4">
                      {r.experience_categories.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {r.experience_categories.map((c) => (
                            <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {experienceLabel.get(c) ?? c}
                            </span>
                          ))}
                        </div>
                      )}
                      {r.additional_feedback ? (
                        <ExpandableText text={r.additional_feedback} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{recommendLabel[r.recommendation]}</td>
                    <td className="px-4 py-4">
                      <StatusSelect id={r.id} status={r.review_status} />
                    </td>
                    <td className="px-4 py-4">
                      <FeatureToggle id={r.id} featured={r.is_featured} allowed={r.display_consent && !!r.additional_feedback} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="mt-4 flex flex-col gap-3 lg:hidden">
            {rows.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{r.customer_name}</p>
                    <a href={`tel:${r.country_code}${r.mobile_number}`} className="text-sm text-muted-foreground tabular-nums">
                      {r.country_code} {r.mobile_number}
                    </a>
                  </div>
                  <Stars rating={r.rating} size="size-3.5" />
                </div>
                {r.experience_categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {r.experience_categories.map((c) => (
                      <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {experienceLabel.get(c) ?? c}
                      </span>
                    ))}
                  </div>
                )}
                {r.additional_feedback && (
                  <div className="mt-3 text-sm">
                    <ExpandableText text={r.additional_feedback} />
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatDateTimeIST(r.created_at)} · Recommends: {recommendLabel[r.recommendation]}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <StatusSelect id={r.id} status={r.review_status} />
                  <FeatureToggle id={r.id} featured={r.is_featured} allowed={r.display_consent && !!r.additional_feedback} />
                </div>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Page {filters.page} of {pages}
              </p>
              <div className="flex gap-2">
                <PageLink href={buildQuery(filters, { page: filters.page - 1 })} disabled={filters.page <= 1} label="Previous page">
                  <ChevronLeft className="size-4" />
                </PageLink>
                <PageLink href={buildQuery(filters, { page: filters.page + 1 })} disabled={filters.page >= pages} label="Next page">
                  <ChevronRight className="size-4" />
                </PageLink>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  const cls = "grid size-10 place-items-center rounded-full border border-border transition";
  if (disabled)
    return (
      <span aria-disabled="true" aria-label={label} className={`${cls} opacity-40`}>
        {children}
      </span>
    );
  return (
    <Link href={`/admin/reviews${href}`} aria-label={label} className={`${cls} hover:bg-muted`}>
      {children}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[90rem] animate-pulse px-4 py-10 sm:px-6 lg:px-10" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-10 w-64 rounded-lg bg-muted" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="mt-10 h-14 rounded-2xl bg-muted" />
      <div className="mt-6 h-96 rounded-2xl bg-muted" />
    </div>
  );
}
