"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { createSessionClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp } from "@/lib/security";
import { REVIEW_STATUSES } from "@/lib/admin/reviews";
import { FEATURED_FEEDBACK_TAG } from "@/lib/featured-feedback";

export type SignInState = { error?: string; email?: string };

const credentialsSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).max(200),
  password: z.string().min(6, { error: "Enter your password." }).max(200),
});

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin/") && !next.startsWith("//") && !next.startsWith("/admin/login") ? next : "/admin/reviews";
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = credentialsSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details.", email };

  const ip = hashIp(clientIp(await headers()));
  const limit = rateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.`, email };

  const supabase = await createSessionClient();
  if (!supabase) return { error: "Admin sign-in is not configured yet. See the README.", email };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Incorrect email or password.", email };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have access to the feedback dashboard.", email };
  }

  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

export type ActionResult = { ok: true } | { ok: false; error: string };

const statusSchema = z.object({ id: z.uuid(), status: z.enum(REVIEW_STATUSES) });

export async function updateReviewStatus(id: string, status: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Your session has expired. Please sign in again." };
  const parsed = statusSchema.safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const supabase = (await createSessionClient())!;
  const { error, count } = await supabase
    .from("customer_reviews")
    .update({ review_status: parsed.data.status }, { count: "exact" })
    .eq("id", parsed.data.id);
  if (error || count === 0) return { ok: false, error: "Couldn't update the status. Please try again." };

  refresh();
  return { ok: true };
}

const featureSchema = z.object({ id: z.uuid(), featured: z.boolean() });

export async function setReviewFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Your session has expired. Please sign in again." };
  const parsed = featureSchema.safeParse({ id, featured });
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const supabase = (await createSessionClient())!;
  // The database also rejects featuring feedback without the guest's display consent.
  const { error, count } = await supabase
    .from("customer_reviews")
    .update({ is_featured: parsed.data.featured }, { count: "exact" })
    .eq("id", parsed.data.id)
    .eq("display_consent", true);
  if (error || count === 0) {
    return { ok: false, error: "Only feedback from guests who agreed to be featured can be shown on the website." };
  }

  updateTag(FEATURED_FEEDBACK_TAG);
  refresh();
  return { ok: true };
}
