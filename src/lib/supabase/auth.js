import { getSupabaseClient } from "./client"
import { getAppRedirectUrl, getSettingsOAuthRedirectUrl } from "./oauthRedirect"
import { fetchGoogleCalendarEvents, getCalendarWindow } from "../google/calendarApi"
import { GOOGLE_CALENDAR_STATUS } from "../../features/google-calendar/constants"

const LOG_PREFIX = "[Max OS Supabase]"

function getUrlOAuthParams(url) {
  const params = new URLSearchParams(url.search)
  const hashBody = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash
  const queryIndex = hashBody.indexOf("?")
  if (queryIndex >= 0) {
    const hashParams = new URLSearchParams(hashBody.slice(queryIndex + 1))
    for (const [key, value] of hashParams.entries()) {
      if (!params.has(key)) params.set(key, value)
    }
  }
  return params
}

function cleanOAuthParamsFromUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete("code")
  url.searchParams.delete("state")
  url.searchParams.delete("error")
  url.searchParams.delete("error_description")

  const hashBody = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash
  const queryIndex = hashBody.indexOf("?")
  if (queryIndex >= 0) {
    const routePart = hashBody.slice(0, queryIndex)
    const hashParams = new URLSearchParams(hashBody.slice(queryIndex + 1))
    hashParams.delete("code")
    hashParams.delete("state")
    hashParams.delete("error")
    hashParams.delete("error_description")
    const remaining = hashParams.toString()
    url.hash = remaining ? `#${routePart}?${remaining}` : `#${routePart}`
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
}

/**
 * Completes Supabase OAuth when returning with ?code= (PKCE) and returns the session.
 */
export async function bootstrapAuthSession() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { session: null, error: null }
  }

  const url = new URL(window.location.href)
  const oauthParams = getUrlOAuthParams(url)
  const code = oauthParams.get("code")
  const authError = oauthParams.get("error")
  const authErrorDescription = oauthParams.get("error_description")

  if (authError) {
    return { session: null, error: authErrorDescription ?? authError }
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    cleanOAuthParamsFromUrl()
    if (error) {
      console.warn(`${LOG_PREFIX} OAuth code exchange failed:`, error.message)
      return { session: null, error: error.message }
    }
    return { session: data.session, error: null }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  return { session, error: null }
}

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
      redirectTo: getAppRedirectUrl("/"),
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

  const redirectTo = getSettingsOAuthRedirectUrl()
  console.info(`${LOG_PREFIX} Google Calendar OAuth redirectTo:`, redirectTo)

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      scopes: "https://www.googleapis.com/auth/calendar.readonly",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    console.warn(`${LOG_PREFIX} Google Calendar connect failed:`, error.message)
    return { ok: false, error: error.message, redirectTo }
  }

  return { ok: true, redirectTo }
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

/**
 * Derives calendar connection status from provider_token and a calendar API probe.
 */
export async function resolveGoogleCalendarStatus({ optIn = false } = {}) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { status: GOOGLE_CALENDAR_STATUS.NOT_CONNECTED, hasProviderToken: false }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { status: GOOGLE_CALENDAR_STATUS.NOT_CONNECTED, hasProviderToken: false }
  }

  const token = session.provider_token ?? (await getGoogleAccessToken())
  if (!token) {
    return {
      status: optIn ? GOOGLE_CALENDAR_STATUS.PERMISSION_NEEDED : GOOGLE_CALENDAR_STATUS.NOT_CONNECTED,
      hasProviderToken: false,
    }
  }

  const window = getCalendarWindow(1)
  const probe = await fetchGoogleCalendarEvents(token, window)

  if (probe.ok) {
    return { status: GOOGLE_CALENDAR_STATUS.CONNECTED, hasProviderToken: true }
  }

  if (probe.reason === "permission_needed") {
    return { status: GOOGLE_CALENDAR_STATUS.PERMISSION_NEEDED, hasProviderToken: true }
  }

  return { status: GOOGLE_CALENDAR_STATUS.NOT_CONNECTED, hasProviderToken: true }
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
