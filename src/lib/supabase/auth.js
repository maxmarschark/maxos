import { getSupabaseClient } from "./client"

const LOG_PREFIX = "[Max OS Supabase]"

/**
 * Returns the current Supabase user from an existing session (no auto sign-in).
 */
export async function getAuthUser() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.user ?? null
}

/** @deprecated Use getAuthUser — kept for existing imports. */
export async function ensureSupabaseSession() {
  return getAuthUser()
}

export async function getSupabaseUserId() {
  const user = await getAuthUser()
  return user?.id ?? null
}

export async function signInWithGoogle() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" }
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  })

  if (error) {
    console.warn(`${LOG_PREFIX} Google sign-in failed:`, error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function connectGoogleCalendar() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" }
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
      scopes: "https://www.googleapis.com/auth/calendar.readonly",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    console.warn(`${LOG_PREFIX} Google Calendar connect failed:`, error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function getGoogleAccessToken() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  let {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.provider_token) {
    const { data } = await supabase.auth.refreshSession()
    session = data.session
  }

  return session?.provider_token ?? null
}

export async function signOut() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" }
  }

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.warn(`${LOG_PREFIX} Sign out failed:`, error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export function getUserDisplayName(user) {
  if (!user) return "User"
  return user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User"
}

export function getUserEmail(user) {
  return user?.email ?? ""
}

export function getUserInitial(user) {
  const name = getUserDisplayName(user)
  return (name[0] ?? "U").toUpperCase()
}

export function getUserAvatarUrl(user) {
  return user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null
}
