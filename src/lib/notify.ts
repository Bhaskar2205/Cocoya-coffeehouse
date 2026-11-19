import "server-only";
import { EXPERIENCE_OPTIONS, RATING_LABELS, type FeedbackData } from "@/lib/feedback/schema";
import { maskPhone } from "@/lib/security";
import { site } from "@/content/site";
import { buildFeedbackEmail, type FeedbackEmailInput } from "@/lib/email/feedback-email";

/**
 * OPTIONAL owner notifications for new feedback.
 *
 * Nothing is sent unless configured. Two independent integration points:
 *
 *   • Email via Resend (https://resend.com):
 *       RESEND_API_KEY, FEEDBACK_NOTIFY_EMAIL, FEEDBACK_FROM_EMAIL
 *   • Generic webhook (Slack, Zapier, Make, n8n, Google Chat…):
 *       FEEDBACK_WEBHOOK_URL  — receives a JSON summary via POST
 *
 * Alerts go to the café owner only. Guests are never sent marketing messages.
 * The owner email carries the guest's full details (incl. mobile number) so
 * the café can call back; the webhook keeps the number masked because it may
 * land in a shared channel. Email template: src/lib/email/feedback-email.ts
 */

type Summary = {
  id: string;
  name: string;
  rating: number;
  ratingLabel: string;
  enjoyed: string[];
  recommendation: string;
  feedback: string | null;
  maskedPhone: string;
  submittedAt: string;
  dashboardUrl: string;
};

function summarise(id: string, data: FeedbackData): Summary {
  const enjoyed = data.experienceCategories.map((v) => EXPERIENCE_OPTIONS.find((o) => o.value === v)?.label ?? v);
  return {
    id,
    name: data.customerName,
    rating: data.rating,
    ratingLabel: RATING_LABELS[data.rating - 1] ?? String(data.rating),
    enjoyed,
    recommendation: data.recommendation,
    feedback: data.additionalFeedback ?? null,
    maskedPhone: `${data.countryCode} ${maskPhone(data.mobileNumber)}`,
    submittedAt: new Date().toISOString(),
    dashboardUrl: `${site.url}/admin/reviews`,
  };
}

async function sendEmail(input: FeedbackEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_NOTIFY_EMAIL;
  const from = process.env.FEEDBACK_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.warn("[notify] Email skipped: set RESEND_API_KEY, FEEDBACK_NOTIFY_EMAIL and FEEDBACK_FROM_EMAIL.");
    return;
  }

  const { subject, html, text } = buildFeedbackEmail(input);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((e) => e.trim()),
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) console.error("[notify] Resend responded", res.status, await res.text().catch(() => ""));
}

async function sendWebhook(s: Summary) {
  const url = process.env.FEEDBACK_WEBHOOK_URL;
  if (!url) return;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "cocoya.feedback.created",
      text: `New Cocoya feedback: ${"★".repeat(s.rating)} from ${s.name} — ${s.feedback ?? "no comment"}`,
      feedback: s,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) console.error("[notify] Webhook responded", res.status);
}

export async function notifyNewFeedback(id: string, data: FeedbackData): Promise<void> {
  const s = summarise(id, data);
  const results = await Promise.allSettled([sendEmail({ id, data, submittedAt: new Date() }), sendWebhook(s)]);
  for (const r of results) if (r.status === "rejected") console.error("[notify] failed:", r.reason);
}
