import "server-only";
import { createHmac } from "node:crypto";

/**
 * Best-effort client IP from standard proxy headers (Vercel, Netlify, Nginx…).
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? "unknown";
}

/**
 * We never store raw IP addresses. A keyed hash lets us rate-limit repeat
 * submissions from the same network without keeping personal data.
 */
export function hashIp(ip: string): string {
  const salt = process.env.FEEDBACK_IP_SALT ?? process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "cocoya-local-salt";
  return createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}

/**
 * Same-origin check for state-changing API requests (defence in depth on top
 * of SameSite cookies and JSON content-type requirements).
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** "9876543210" → "••••••3210" */
export function maskPhone(digits: string): string {
  return digits.length <= 4 ? digits : `${"•".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}
