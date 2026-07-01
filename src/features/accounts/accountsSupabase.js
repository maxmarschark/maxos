import { getSupabaseClient } from "../../lib/supabase/client"
import { getSupabaseUserId } from "../../lib/supabase/auth"
import { isSupabaseConfigured } from "../../lib/supabase/env"
import { parseAccountRow, transformAccount } from "../../lib/supabase/transformers"

const LOG_PREFIX = "[Max OS Accounts]"

async function resolveScopeUserId() {
  const userId = await getSupabaseUserId()
  return userId
}

async function accountsQuery() {
  const supabase = getSupabaseClient()
  if (!supabase) return { supabase: null, userId: null }

  const userId = await resolveScopeUserId()
  let query = supabase
    .from("accounts")
    .select("*")
    .order("updated_at", { ascending: false, nullsFirst: false })

  if (userId) {
    query = query.eq("user_id", userId)
  }

  return { supabase, userId, query }
}

export async function fetchCloudAccounts() {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase not configured" }
  }

  const { supabase, userId, query } = await accountsQuery()
  if (!supabase || !query) {
    return { ok: false, error: "Supabase client unavailable" }
  }

  const { data, error } = await query

  if (error) {
    return { ok: false, error: error.message, code: error.code }
  }

  return {
    ok: true,
    accounts: (data ?? []).map(parseAccountRow),
    authenticated: Boolean(userId),
  }
}

export async function insertCloudAccount(account) {
  const supabase = getSupabaseClient()
  const userId = await resolveScopeUserId()
  if (!supabase) {
    return { ok: false, error: "Supabase client unavailable" }
  }

  const row = transformAccount(account, userId)
  const { data, error } = await supabase.from("accounts").insert(row).select().single()

  if (error) {
    return { ok: false, error: error.message, code: error.code }
  }

  return { ok: true, account: parseAccountRow(data) }
}

export async function updateCloudAccount(account) {
  const supabase = getSupabaseClient()
  const userId = await resolveScopeUserId()
  if (!supabase) {
    return { ok: false, error: "Supabase client unavailable" }
  }

  const row = transformAccount(account, userId)
  let query = supabase.from("accounts").update(row).eq("id", account.id)
  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query.select().single()

  if (error) {
    return { ok: false, error: error.message, code: error.code }
  }

  return { ok: true, account: parseAccountRow(data) }
}

export async function deleteCloudAccount(accountId) {
  const supabase = getSupabaseClient()
  const userId = await resolveScopeUserId()
  if (!supabase) {
    return { ok: false, error: "Supabase client unavailable" }
  }

  let query = supabase.from("accounts").delete().eq("id", accountId)
  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { error } = await query

  if (error) {
    return { ok: false, error: error.message, code: error.code }
  }

  return { ok: true }
}

export async function initCloudAccounts() {
  if (!isSupabaseConfigured()) {
    console.info(`${LOG_PREFIX} LOCAL — Supabase env vars not configured`)
    return { ok: false, reason: "not_configured" }
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    console.info(`${LOG_PREFIX} LOCAL — Supabase client could not be created`)
    return { ok: false, reason: "client_init_failed" }
  }

  const result = await fetchCloudAccounts()

  if (!result.ok) {
    console.error(`${LOG_PREFIX} LOCAL — database error:`, result.error)
    if (result.code === "42501" || result.code === "PGRST301") {
      console.error(
        `${LOG_PREFIX} Hint: enable Anonymous sign-in, set VITE_SUPABASE_EMAIL + VITE_SUPABASE_PASSWORD in .env, or run supabase/accounts-cloud-access.sql`
      )
    }
    if (result.code === "42P01" || result.error?.includes("does not exist")) {
      console.error(`${LOG_PREFIX} Hint: run supabase/schema.sql in the Supabase SQL editor`)
    }
    return { ok: false, reason: "fetch_failed", error: result.error }
  }

  const authLabel = result.authenticated ? "authenticated session" : "publishable key"
  console.info(
    `${LOG_PREFIX} CLOUD — loaded ${result.accounts.length} account(s) via ${authLabel}`
  )

  return { ok: true, accounts: result.accounts }
}
