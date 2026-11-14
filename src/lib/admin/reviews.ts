import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const REVIEW_STATUSES = ["new", "reviewed", "resolved"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const STATUS_LABEL: Record<ReviewStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

export type ReviewRow = {
  id: string;
  created_at: string;
  customer_name: string;
  country_code: string;
  mobile_number: string;
  rating: number;
  experience_categories: string[];
  additional_feedback: string | null;
  recommendation: "yes" | "maybe" | "no";
  review_status: ReviewStatus;
  display_consent: boolean;
  is_featured: boolean;
};

export type ReviewStats = {
  total_reviews: number;
  average_rating: number;
  five_star: number;
  new_reviews: number;
  would_recommend: number;
};

export const PAGE_SIZE = 25;

const filtersSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional().catch(undefined),
  status: z.enum(REVIEW_STATUSES).optional().catch(undefined),
  q: z.string().trim().max(80).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).optional().catch(undefined),
});

export type ReviewFilters = { rating?: number; status?: ReviewStatus; q?: string; page: number };

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

export function parseFilters(params: RawParams): ReviewFilters {
  const get = (k: string) => {
    const v = params instanceof URLSearchParams ? params.get(k) : params[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s === null || s === "" || s === "all" ? undefined : s;
  };
  const parsed = filtersSchema.parse({ rating: get("rating"), status: get("status"), q: get("q"), page: get("page") });
  return { rating: parsed.rating, status: parsed.status, q: parsed.q || undefined, page: parsed.page ?? 1 };
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

const COLUMNS =
  "id, created_at, customer_name, country_code, mobile_number, rating, experience_categories, additional_feedback, recommendation, review_status, display_consent, is_featured";

/**
 * Builds the filtered feedback query. Runs with the ADMIN'S session client,
 * so Row Level Security still applies to every row returned.
 */
export function reviewsQuery(supabase: SupabaseClient, filters: ReviewFilters, opts: { paginate: boolean }) {
  let query = supabase
    .from("customer_reviews")
    .select(COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.rating) query = query.eq("rating", filters.rating);
  if (filters.status) query = query.eq("review_status", filters.status);
  if (filters.q) query = query.ilike("customer_name", `%${escapeLike(filters.q)}%`);
  if (opts.paginate) {
    const from = (filters.page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);
  } else {
    query = query.limit(10_000);
  }
  return query;
}
