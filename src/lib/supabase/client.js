import { createClient } from "@supabase/supabase-js"
import { getSupabaseConfig } from "./env"

/** @type {import("@supabase/supabase-js").SupabaseClient | null} */
let client = null

/**
 * Returns a singleton Supabase client when env vars are set, otherwise null.
 * Callers should fall back to localStorage when this returns null.
 */
export function getSupabaseClient() {
  const config = getSupabaseConfig()
  if (!config) {
    return null
  }

  if (!client) {
    client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // HashRouter owns the URL hash; OAuth PKCE is handled in bootstrapAuthSession.
        detectSessionInUrl: false,
        flowType: "pkce",
      },
    })
  }

  return client
}

/** Reset cached client (useful in tests). */
export function resetSupabaseClient() {
  client = null
}
