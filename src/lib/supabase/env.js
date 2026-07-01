/**
 * Supabase environment configuration.
 * Returns null when credentials are missing so the app keeps using localStorage.
 */
export function getSupabaseEnvStatus() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ""
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ""

  let urlHost = null
  if (url) {
    try {
      urlHost = new URL(url).host
    } catch {
      urlHost = "invalid URL"
    }
  }

  return {
    configured: Boolean(url && anonKey),
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    urlHost,
  }
}

export function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey }
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null
}
