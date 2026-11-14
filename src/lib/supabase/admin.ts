import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./config";

let cached: SupabaseClient | null = null;

/**
 * Privileged server-side client (secret / service-role key).
 *
 * Used for exactly two narrow jobs:
 *   1. Inserting new guest feedback from the validated API route.
 *   2. Reading the public-safe columns of feedback that an admin has approved
 *      for display (first name, rating, comment) — never phone numbers.
 *
 * It bypasses Row Level Security, so it must never be imported into client
 * components ("server-only" enforces this at build time).
 */
export function createServiceClient(): SupabaseClient | null {
  const { url, secretKey } = supabaseEnv();
  if (!url || !secretKey) return null;
  if (!cached) {
    cached = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { "x-application-name": "cocoya-web" } },
    });
  }
  return cached;
}
