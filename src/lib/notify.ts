import "server-only";
import { EXPERIENCE_OPTIONS, RATING_LABELS, type FeedbackData } from "@/lib/feedback/schema";
import { maskPhone } from "@/lib/security";
import { site } from "@/content/site";

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
 * Alerts go to the café owner only. Guests are never sent marketing messages;
 * the phone number is masked in alerts — the full number stays in the
 * protected admin dashboard.
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

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function sendEmail(s: Summary) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_NOTIFY_EMAIL;
  const from = process.env.FEEDBACK_FROM_EMAIL;
  if (!apiKey || !to || !from) return;

  const stars = "★".repeat(s.rating) + "☆".repeat(5 - s.rating);
  const text = [
    `New guest feedback — ${stars} (${s.ratingLabel})`,
    `Guest: ${s.name} (${s.maskedPhone})`,
    `Enjoyed: ${s.enjoyed.join(", ") || "—"}`,
    `Would recommend: ${s.recommendation}`,
    `Comment: ${s.feedback ?? "—"}`,
    ``,
    `Open the dashboard: ${s.dashboardUrl}`,
  ].join("\n");

  const html = `<div style="font-family:Georgia,serif;background:#faf5ee;padding:24px;color:#1a110c">
  <h2 style="margin:0 0 4px;font-weight:500">New guest feedback</h2>
  <p style="margin:0 0 16px;color:#b98250;font-size:20px;letter-spacing:2px">${stars} <span style="font-size:14px;color:#6e5a4b">${escapeHtml(s.ratingLabel)}</span></p>
  <table style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">
    <tr><td style="color:#6e5a4b;padding-right:12px">Guest</td><td>${escapeHtml(s.name)} · ${escapeHtml(s.maskedPhone)}</td></tr>
    <tr><td style="color:#6e5a4b;padding-right:12px">Enjoyed</td><td>${escapeHtml(s.enjoyed.join(", ") || "—")}</td></tr>
    <tr><td style="color:#6e5a4b;padding-right:12px">Recommend</td><td>${escapeHtml(s.recommendation)}</td></tr>
  </table>
  ${s.feedback ? `<blockquote style="margin:16px 0;padding:12px 16px;background:#fff;border-left:3px solid #b98250;font-size:15px">${escapeHtml(s.feedback)}</blockquote>` : ""}
  <a href="${escapeHtml(s.dashboardUrl)}" style="display:inline-block;margin-top:8px;background:#1a110c;color:#faf5ee;padding:10px 18px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px">Open dashboard</a>
</div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((e) => e.trim()),
      subject: `${stars} New feedback from ${s.name}`,
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
  const results = await Promise.allSettled([sendEmail(s), sendWebhook(s)]);
  for (const r of results) if (r.status === "rejected") console.error("[notify] failed:", r.reason);
}
