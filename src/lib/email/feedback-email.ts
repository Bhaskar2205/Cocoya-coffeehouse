import { EXPERIENCE_OPTIONS, RATING_LABELS, RECOMMENDATION_OPTIONS, type FeedbackData } from "@/lib/feedback/schema";
import { site } from "@/content/site";

/**
 * Owner alert email for a new guest feedback submission.
 *
 * Pure function (no I/O), so it is easy to preview or test.
 * Built with tables + inline styles because that is what email clients
 * (Gmail, Outlook, Apple Mail) reliably render.
 */

export type FeedbackEmailInput = {
  id: string;
  data: FeedbackData;
  submittedAt: Date;
};

export type FeedbackEmail = { subject: string; html: string; text: string };

const C = {
  page: "#f3ece2",
  card: "#ffffff",
  roast: "#1a110c",
  cocoa: "#6e5a4b",
  caramel: "#b98250",
  line: "#eadfd2",
  foam: "#faf5ee",
  alertBg: "#fdecea",
  alertInk: "#9b2c22",
  goodBg: "#eef6ec",
  goodInk: "#2f6b3a",
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function formatWhen(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function buildFeedbackEmail({ id, data, submittedAt }: FeedbackEmailInput): FeedbackEmail {
  const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
  const ratingLabel = RATING_LABELS[data.rating - 1] ?? String(data.rating);
  const enjoyed = data.experienceCategories.map((v) => EXPERIENCE_OPTIONS.find((o) => o.value === v)?.label ?? v);
  const recommend = RECOMMENDATION_OPTIONS.find((o) => o.value === data.recommendation)?.label ?? data.recommendation;
  const comment = data.additionalFeedback?.trim() || null;
  const digits = `${data.countryCode}${data.mobileNumber}`.replace(/[^\d+]/g, "");
  const phoneDisplay = `${data.countryCode} ${data.mobileNumber}`;
  const telUrl = `tel:${digits}`;
  const whatsappUrl = `https://wa.me/${digits.replace(/^\+/, "")}`;
  const when = formatWhen(submittedAt);
  const dashboardUrl = `${site.url}/admin/reviews`;
  const ref = id.slice(0, 8).toUpperCase();
  const needsAttention = data.rating <= 3 || data.recommendation === "no";

  const subject = needsAttention
    ? `⚠️ ${stars} Needs attention: feedback from ${data.customerName}`
    : `${stars} New feedback from ${data.customerName}`;

  const row = (label: string, valueHtml: string) => `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid ${C.line};width:38%;vertical-align:top;font-size:13px;color:${C.cocoa}">${label}</td>
            <td style="padding:12px 0;border-bottom:1px solid ${C.line};vertical-align:top;font-size:15px;color:${C.roast}">${valueHtml}</td>
          </tr>`;

  const chips = enjoyed.length
    ? enjoyed
        .map(
          (e) =>
            `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 12px;border-radius:999px;background:${C.foam};border:1px solid ${C.line};font-size:13px">${escapeHtml(e)}</span>`,
        )
        .join("")
    : `<span style="color:${C.cocoa}">Not selected</span>`;

  const banner = needsAttention
    ? `<tr><td style="padding:14px 32px;background:${C.alertBg};color:${C.alertInk};font-size:14px;font-weight:600">
          This guest wasn&rsquo;t fully happy. A quick call or WhatsApp today can turn it around.
        </td></tr>`
    : `<tr><td style="padding:14px 32px;background:${C.goodBg};color:${C.goodInk};font-size:14px;font-weight:600">
          A happy guest! They were invited to share their review on Google too.
        </td></tr>`;

  const button = (href: string, label: string, primary: boolean) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;${
      primary ? `background:${C.roast};color:${C.foam}` : `background:${C.card};color:${C.roast};border:1px solid ${C.roast}`
    }">${label}</a>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page}">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(`${ratingLabel} · ${comment ?? "No comment"}`).slice(0, 140)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}">
  <tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.card};border-radius:16px;overflow:hidden;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
      <tr><td style="padding:28px 32px 20px;background:${C.roast};color:${C.foam}">
        <div style="font-family:Georgia,serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${C.caramel}">${escapeHtml(site.name)}</div>
        <div style="font-family:Georgia,serif;font-size:26px;margin-top:6px">New guest feedback</div>
        <div style="font-size:13px;margin-top:6px;opacity:.75">${escapeHtml(when)} IST · Ref #${escapeHtml(ref)}</div>
      </td></tr>
      ${banner}
      <tr><td style="padding:28px 32px 8px;text-align:center">
        <div style="font-size:34px;letter-spacing:4px;color:${C.caramel}">${stars}</div>
        <div style="font-size:15px;color:${C.cocoa};margin-top:4px">${data.rating}/5 · ${escapeHtml(ratingLabel)}</div>
      </td></tr>
      ${
        comment
          ? `<tr><td style="padding:16px 32px 0">
        <div style="padding:16px 20px;background:${C.foam};border-left:4px solid ${C.caramel};border-radius:8px;font-family:Georgia,serif;font-size:17px;line-height:1.55;color:${C.roast};white-space:pre-wrap">&ldquo;${escapeHtml(comment)}&rdquo;</div>
      </td></tr>`
          : ""
      }
      <tr><td style="padding:16px 32px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row("Guest name", `<strong>${escapeHtml(data.customerName)}</strong>`)}
          ${row("Mobile", `<a href="${escapeHtml(telUrl)}" style="color:${C.roast}">${escapeHtml(phoneDisplay)}</a>`)}
          ${row("Rating", `${stars} <span style="color:${C.cocoa}">(${escapeHtml(ratingLabel)})</span>`)}
          ${row("Enjoyed", chips)}
          ${row("Would recommend", `<strong>${escapeHtml(recommend)}</strong>`)}
          ${row("Comment", comment ? "See above" : `<span style="color:${C.cocoa}">No written comment</span>`)}
          ${row(
            "On website",
            data.displayConsent && comment
              ? `Live now <span style="color:${C.cocoa}">(hide it from the dashboard)</span>`
              : `<span style="color:${C.cocoa}">Private, not shown</span>`,
          )}
          ${row("Submitted", `${escapeHtml(when)} IST`)}
        </table>
      </td></tr>
      <tr><td style="padding:24px 32px 8px">
        ${button(telUrl, "📞 Call guest", true)}
        ${button(whatsappUrl, "💬 WhatsApp", false)}
        ${button(dashboardUrl, "Open dashboard", false)}
      </td></tr>
      <tr><td style="padding:16px 32px 28px;font-size:12px;line-height:1.5;color:${C.cocoa}">
        The guest agreed to be contacted about this feedback only. Please don&rsquo;t use their number for promotions.
        Sent automatically by ${escapeHtml(site.url.replace(/^https?:\/\//, ""))}.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    `NEW GUEST FEEDBACK · ${site.name}`,
    needsAttention ? "⚠️ Needs attention: this guest wasn't fully happy." : "A happy guest!",
    ``,
    `Rating:          ${stars} ${data.rating}/5 (${ratingLabel})`,
    `Guest name:      ${data.customerName}`,
    `Mobile:          ${phoneDisplay}`,
    `Enjoyed:         ${enjoyed.join(", ") || "Not selected"}`,
    `Would recommend: ${recommend}`,
    `On website:      ${data.displayConsent && comment ? "Live now (hide it from the dashboard)" : "Private, not shown"}`,
    `Submitted:       ${when} IST`,
    `Reference:       #${ref}`,
    ``,
    `Comment:`,
    comment ?? "(no written comment)",
    ``,
    `Call: ${telUrl}`,
    `WhatsApp: ${whatsappUrl}`,
    `Dashboard: ${dashboardUrl}`,
  ].join("\n");

  return { subject, html, text };
}
