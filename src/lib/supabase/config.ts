import "server-only";

/**
 * Supabase credentials are read ONLY on the server. Nothing here is prefixed
 * with NEXT_PUBLIC_, so keys can never be bundled into browser JavaScript —
 * the browser talks exclusively to this app's own API routes / server actions.
 */
export function supabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, publishableKey, secretKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, publishableKey, secretKey } = supabaseEnv();
  return Boolean(url && publishableKey && secretKey);
}
