import { getSupabaseClient } from "../../lib/supabase/client"
import { getSupabaseUserId } from "../../lib/supabase/auth"
import { isSupabaseConfigured } from "../../lib/supabase/env"
import {
  createLogPrefix,
  describeCloudSuccess,
  fetchTableRows,
  describeCloudFailure,
} from "../../lib/supabase/cloudRepository"
import { parseAccountRow, transformAccount } from "../../lib/supabase/transformers"

const LOG_PREFIX = createLogPrefix("Accounts")

async function resolveScopeUserId() {
  return getSupabaseUserId()
}

async function accountsQuery() {
  const supabase = getSupabaseClient()
  if (!supabase) return { supabase: null, userId: null, query: null }

  const userId = await resolveScopeUserId()
  const query = fetchTableRows(supabase, {
    table: "accounts",
    orderBy: "updated_at",
    fallbackOrderBy: "id",
    userId,
    logPrefix: LOG_PREFIX,
  })

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
    return { ok: false, error: error.message, code: error.code, table: "accounts" }
  }

  return {
    ok: true,
    accounts: (data ?? []).map(parseAccountRow),
    rows: (data ?? []).map(parseAccountRow),
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
    return { ok: false, reason: "not_configured", table: "accounts" }
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: false, reason: "client_init_failed", table: "accounts" }
  }

  const result = await fetchCloudAccounts()

  if (!result.ok) {
    console.error(`${LOG_PREFIX} LOCAL — ${describeCloudFailure(result)}`)
    return { ok: false, reason: "fetch_failed", error: result.error, code: result.code, table: "accounts" }
  }

  return {
    ok: true,
    accounts: result.accounts,
    rows: result.accounts,
    authenticated: result.authenticated,
    logMessage: describeCloudSuccess(result),
  }
}
