import { getSupabaseClient } from "./client"

const LOG_PREFIX = "[Max OS Accounts]"

function logAuthFailure(method, error) {
  if (!error) return
  console.warn(`${LOG_PREFIX} Auth (${method}) failed:`, error.message)
}

/**
 * Returns the signed-in Supabase user.
 * Tries existing session → email/password env → anonymous sign-in.
 */
export async function ensureSupabaseSession() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user) {
    return session.user
  }

  const email = import.meta.env.VITE_SUPABASE_EMAIL?.trim()
  const password = import.meta.env.VITE_SUPABASE_PASSWORD?.trim()

  if (email && password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.user) {
      console.info(`${LOG_PREFIX} Authenticated via email/password`)
      return data.user
    }
    logAuthFailure("email/password", error)
  }

  const { data, error } = await supabase.auth.signInAnonymously()
  if (!error && data.user) {
    console.info(`${LOG_PREFIX} Authenticated via anonymous session`)
    return data.user
  }
  logAuthFailure("anonymous", error)

  return null
}

export async function getSupabaseUserId() {
  const user = await ensureSupabaseSession()
  return user?.id ?? null
}
