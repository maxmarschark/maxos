import { getSupabaseClient } from "./client"
import { getSupabaseUserId } from "./auth"
import { isSupabaseConfigured } from "./env"

export function createLogPrefix(moduleName) {
  return `[Max OS ${moduleName}]`
}

const EXTENSION_TABLES = new Set(["deals", "calendar_events"])

export function describeCloudFailure(result) {
  const { error, code, reason, table } = result
  if (reason === "not_configured") {
    return "Supabase env vars not configured"
  }
  if (reason === "client_init_failed") {
    return "Supabase client could not be created"
  }
  if (code === "42P01" || error?.includes("does not exist")) {
    const sqlHint = EXTENSION_TABLES.has(table)
      ? "run supabase/schema.sql and supabase/schema-extensions.sql"
      : "run supabase/schema.sql and supabase/schema-extensions.sql"
    return `missing table${table ? ` "${table}"` : ""} (${error ?? code}) — ${sqlHint}`
  }
  if (code === "42703") {
    return `column mismatch (${error}) — run supabase/schema-extensions.sql to add missing columns`
  }
  if (code === "PGRST204") {
    return `column missing in Supabase schema cache (${error}) — run supabase/schema-extensions.sql, then reload the API schema in Supabase Dashboard → Settings → API`
  }
  if (code === "42501" || code === "PGRST301") {
    return `RLS policy blocked access (${error ?? code}) — run supabase/schema-extensions.sql or enable auth`
  }
  if (reason === "fetch_failed") {
    return error ?? "database fetch failed"
  }
  return error ?? reason ?? "unknown error"
}

export function describeCloudSuccess(result) {
  const count = result.rows?.length ?? 0
  const auth = result.authenticated ? "authenticated session" : "publishable key"
  return `loaded ${count} row(s) via ${auth}`
}

export async function resolveScopeUserId() {
  return getSupabaseUserId()
}

export async function probeSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: "not_configured" }
  }
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: false, reason: "client_init_failed" }
  }
  return { ok: true, supabase }
}

/**
 * Runs a select with optional ordering. Retries without sort when orderBy column is missing.
 */
export async function fetchTableRows(supabase, { table, select = "*", orderBy, fallbackOrderBy, userId, logPrefix }) {
  let query = supabase.from(table).select(select)
  if (userId) {
    query = query.eq("user_id", userId)
  }

  if (!orderBy) {
    return query
  }

  const ordered = await query.order(orderBy, { ascending: false, nullsFirst: false })
  if (!ordered.error) {
    return ordered
  }

  if (ordered.error.code === "42703") {
    console.warn(
      `${logPrefix} column "${orderBy}" missing on "${table}" — retrying without sort (run supabase/schema-extensions.sql)`
    )
    if (fallbackOrderBy && fallbackOrderBy !== orderBy) {
      const fallback = await query.order(fallbackOrderBy, { ascending: false, nullsFirst: false })
      if (!fallback.error) {
        return fallback
      }
    }
    return query
  }

  return ordered
}

export function createCloudCrud({
  moduleName,
  table,
  parseRow,
  toRow,
  primaryKey = "id",
  orderBy = "updated_at",
  fallbackOrderBy,
}) {
  const LOG_PREFIX = createLogPrefix(moduleName)
  const sortFallback = fallbackOrderBy ?? primaryKey

  async function fetchAll() {
    const probe = await probeSupabaseClient()
    if (!probe.ok) {
      return { ok: false, error: probe.reason }
    }

    const userId = await resolveScopeUserId()
    const { data, error } = await fetchTableRows(probe.supabase, {
      table,
      select: "*",
      orderBy,
      fallbackOrderBy: sortFallback,
      userId,
      logPrefix: LOG_PREFIX,
    })

    if (error) {
      return { ok: false, error: error.message, code: error.code, table }
    }

    return {
      ok: true,
      rows: (data ?? []).map(parseRow),
      authenticated: Boolean(userId),
    }
  }

  async function insert(entity) {
    const probe = await probeSupabaseClient()
    if (!probe.ok) return { ok: false, error: probe.reason }

    const userId = await resolveScopeUserId()
    if (!userId) {
      return {
        ok: false,
        error: "Sign in required to save to Supabase",
        code: "not_authenticated",
      }
    }

    const row = toRow(entity, userId)
    if (table === "contacts") {
      console.log("[Supabase] FINAL INSERT PAYLOAD", JSON.stringify(row, null, 2))
    }
    const { data, error } = await probe.supabase.from(table).insert(row).select().single()

    if (error) {
      return {
        ok: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      }
    }

    return { ok: true, row: parseRow(data) }
  }

  async function update(entity) {
    const probe = await probeSupabaseClient()
    if (!probe.ok) return { ok: false, error: probe.reason }

    const userId = await resolveScopeUserId()
    if (!userId) {
      return {
        ok: false,
        error: "Sign in required to save to Supabase",
        code: "not_authenticated",
      }
    }

    const row = toRow(entity, userId)
    const rowId =
      primaryKey === "order_id"
        ? entity.orderId ?? row.order_id
        : entity.id ?? row[primaryKey]

    let query = probe.supabase.from(table).update(row).eq(primaryKey, rowId)
    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query.select().single()
    if (error) {
      return {
        ok: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      }
    }

    return { ok: true, row: parseRow(data) }
  }

  async function remove(id) {
    const probe = await probeSupabaseClient()
    if (!probe.ok) return { ok: false, error: probe.reason }

    const userId = await resolveScopeUserId()
    if (!userId) {
      return {
        ok: false,
        error: "Sign in required to save to Supabase",
        code: "not_authenticated",
      }
    }

    let query = probe.supabase.from(table).delete().eq(primaryKey, id)
    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { error } = await query
    if (error) {
      return {
        ok: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      }
    }

    return { ok: true }
  }

  async function init() {
    const probe = await probeSupabaseClient()
    if (!probe.ok) {
      return { ok: false, reason: probe.reason, table }
    }

    const probeColumn = primaryKey === "order_id" ? "order_id" : "id"
    const { error: tableError } = await probe.supabase.from(table).select(probeColumn).limit(1)
    if (tableError) {
      return {
        ok: false,
        reason: "fetch_failed",
        error: tableError.message,
        code: tableError.code,
        table,
      }
    }

    const result = await fetchAll()
    if (!result.ok) {
      return { ok: false, reason: "fetch_failed", error: result.error, code: result.code, table }
    }

    return {
      ok: true,
      rows: result.rows,
      authenticated: result.authenticated,
      logMessage: describeCloudSuccess(result),
    }
  }

  return { fetchAll, insert, update, remove, init, LOG_PREFIX }
}
