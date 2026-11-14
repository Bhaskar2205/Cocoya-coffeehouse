import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export type AdminUser = { id: string; email: string | null };

/**
 * Returns the signed-in administrator, or null.
 *
 * Two checks, both enforced by Supabase rather than by trusting the browser:
 *   1. `auth.getUser()` validates the session token with Supabase Auth.
 *   2. `is_admin()` (SECURITY DEFINER SQL function) confirms the user is listed
 *      in `public.admin_users`. Signed-in non-admins get nothing.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSessionClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return null;

  return { id: user.id, email: user.email ?? null };
}

/** Use at the top of every admin page, server action and admin API route. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return admin;
}
