import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./config";

/**
 * Cookie-bound Supabase client that acts AS the signed-in administrator.
 * Every query it makes is filtered by Row Level Security (see the migration):
 * only users listed in `public.admin_users` can read or update feedback.
 */
export async function createSessionClient() {
  // Read cookies FIRST: this marks every caller as request-time (dynamic), so a
  // build without env vars can never bake a static redirect into admin pages.
  const cookieStore = await cookies();
  const { url, publishableKey } = supabaseEnv();
  if (!url || !publishableKey) return null;

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — cookies are read-only there.
          // The proxy refreshes the session cookie on the next request instead.
        }
      },
    },
  });
}
