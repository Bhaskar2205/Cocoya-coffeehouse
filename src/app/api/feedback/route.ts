import { after, NextResponse } from "next/server";
import {
  feedbackSchema,
  flattenErrors,
  MIN_FILL_TIME_MS,
  submissionEnvelopeSchema,
} from "@/lib/feedback/schema";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin } from "@/lib/security";
import { notifyNewFeedback } from "@/lib/notify";

const MAX_BODY_BYTES = 8 * 1024;
const IP_LIMIT_PER_HOUR = 6;
const MOBILE_LIMIT_PER_DAY = 3;

type ApiResponse =
  | { ok: true; stored: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function json(body: ApiResponse, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request) {
  // 1 ─ Only accept JSON posted from this site.
  if (!isSameOrigin(request)) {
    return json({ ok: false, error: "This request isn't allowed." }, 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "Unsupported request format." }, 415);
  }

  // 2 ─ Instant per-instance throttle.
  const ip = clientIp(request.headers);
  const ipHash = hashIp(ip);
  const burst = rateLimit(`feedback:${ipHash}`, 5, 10 * 60 * 1000);
  if (!burst.ok) {
    return json(
      { ok: false, error: "You've sent a few submissions already. Please try again a little later." },
      429,
      { "Retry-After": String(burst.retryAfterSeconds) },
    );
  }

  // 3 ─ Read a bounded body.
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Your message is too long." }, 413);
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "We couldn't read your submission. Please try again." }, 400);
  }

  const envelope = submissionEnvelopeSchema.safeParse(payload);
  if (!envelope.success) {
    return json({ ok: false, error: "Please refresh the page and try again." }, 400);
  }

  // 4 ─ Spam traps. A filled honeypot gets a quiet "success" so bots learn nothing.
  if (envelope.data.website) {
    return json({ ok: true, stored: false });
  }
  const elapsed = Date.now() - envelope.data.startedAt;
  if (elapsed < MIN_FILL_TIME_MS) {
    return json({ ok: false, error: "That was quick! Please take a moment to review your answers and submit again." }, 400);
  }

  // 5 ─ Validate every field on the server (never trust the browser).
  const parsed = feedbackSchema.safeParse((payload as { data?: unknown }).data);
  if (!parsed.success) {
    return json(
      { ok: false, error: "Please check the highlighted fields.", fieldErrors: flattenErrors(parsed.error) },
      422,
    );
  }
  const data = parsed.data;

  // 6 ─ Storage.
  const supabase = createServiceClient();
  if (!supabase || !isSupabaseConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[feedback] Supabase is not configured — submission validated but NOT stored (development only):", {
        name: data.customerName,
        rating: data.rating,
        categories: data.experienceCategories,
        recommendation: data.recommendation,
      });
      return json({ ok: true, stored: false });
    }
    console.error("[feedback] Supabase environment variables are missing in production.");
    return json({ ok: false, error: "Feedback is temporarily unavailable. Please try again soon." }, 503);
  }

  // 7 ─ Durable rate limits that hold across serverless instances.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [byIp, byMobile] = await Promise.all([
    supabase.from("customer_reviews").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo),
    supabase
      .from("customer_reviews")
      .select("id", { count: "exact", head: true })
      .eq("mobile_number", data.mobileNumber)
      .gte("created_at", dayAgo),
  ]);
  if ((byIp.count ?? 0) >= IP_LIMIT_PER_HOUR || (byMobile.count ?? 0) >= MOBILE_LIMIT_PER_DAY) {
    return json(
      { ok: false, error: "Thank you — we've already received feedback from you recently. Please try again tomorrow." },
      429,
    );
  }

  // 8 ─ Insert (idempotent thanks to the unique submission_key).
  const { data: inserted, error } = await supabase
    .from("customer_reviews")
    .insert({
      customer_name: data.customerName,
      mobile_number: data.mobileNumber,
      country_code: data.countryCode,
      rating: data.rating,
      experience_categories: data.experienceCategories,
      additional_feedback: data.additionalFeedback ?? null,
      recommendation: data.recommendation,
      privacy_consent: data.privacyConsent,
      display_consent: data.displayConsent,
      submission_key: envelope.data.submissionKey,
      ip_hash: ipHash,
      user_agent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Duplicate submission_key → this exact submission was already saved.
      return json({ ok: true, stored: true });
    }
    console.error("[feedback] insert failed:", error.code, error.message);
    return json({ ok: false, error: "Something went wrong while saving your feedback. Please try again." }, 500);
  }

  // 9 ─ Notify the owner after the response is sent (never blocks the guest).
  after(() => notifyNewFeedback(inserted.id, data));

  return json({ ok: true, stored: true }, 201);
}
