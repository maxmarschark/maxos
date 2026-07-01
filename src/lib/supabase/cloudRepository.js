import { getSupabaseClient } from "./client"
import { getSupabaseUserId } from "./auth"
import { isSupabaseConfigured } from "./env"

export function createLogPrefix(moduleName) {
  return `[Max OS ${moduleName}]`
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

export function createCloudCrud({
  moduleName,
  table,
  parseRow,
  toRow,
  primaryKey = "id",
  orderBy = "updated_at",
}) {
  const LOG_PREFIX = createLogPrefix(moduleName)

  async function scopedQuery(select = "*") {
    const probe = await probeSupabaseClient()
    if (!probe.ok) return { ok: false, error: probe.reason, supabase: null, query: null, userId: null }

    const userId = await resolveScopeUserId()
    let query = probe.supabase
      .from(table)
      .select(select)
      .order(orderBy, { ascending: false, nullsFirst: false })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    return { ok: true, supabase: probe.supabase, query, userId }
  }

  async function fetchAll() {
    const scoped = await scopedQuery()
    if (!scoped.ok) {
      return { ok: false, error: scoped.error }
    }

    const { data, error } = await scoped.query
    if (error) {
      return { ok: false, error: error.message, code: error.code }
    }

    return {
      ok: true,
      rows: (data ?? []).map(parseRow),
      authenticated: Boolean(scoped.userId),
    }
  }

  async function insert(entity) {
    const probe = await probeSupabaseClient()
    if (!probe.ok) return { ok: false, error: probe.error }

    const userId = await resolveScopeUserId()
    const row = toRow(entity, userId)
    const { data, error } = await probe.supabase.from(table).insert(row).select().single()

    if (error) {
      return { ok: false, error: error.message, code: error.code }
    }

    return { ok: true, row: parseRow(data) }
  }

  async function update(entity) {
    const probe = await probeSupabaseClient()
    if (!probe.ok) return { ok: false, error: probe.error }

    const userId = await resolveScopeUserId()
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
      return { ok: false, error: error.message, code: error.code }
    }

    return { ok: true, row: parseRow(data) }
  }

  async function remove(id) {
    const probe = await probeSupabaseClient()
    if (!probe.ok) return { ok: false, error: probe.error }

    const userId = await resolveScopeUserId()
    let query = probe.supabase.from(table).delete().eq(primaryKey, id)
    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { error } = await query
    if (error) {
      return { ok: false, error: error.message, code: error.code }
    }

    return { ok: true }
  }

  async function init() {
    const probe = await probeSupabaseClient()
    if (!probe.ok) {
      console.info(`${LOG_PREFIX} LOCAL — Supabase env vars not configured`)
      return { ok: false, reason: probe.reason }
    }

    const probeColumn = primaryKey === "order_id" ? "order_id" : "id"
    const { error: tableError } = await probe.supabase.from(table).select(probeColumn).limit(1)
    if (tableError) {
      console.error(`${LOG_PREFIX} LOCAL — database error:`, tableError.message)
      return { ok: false, reason: "fetch_failed", error: tableError.message, code: tableError.code }
    }

    const result = await fetchAll()
    if (!result.ok) {
      console.error(`${LOG_PREFIX} LOCAL — database error:`, result.error)
      return { ok: false, reason: "fetch_failed", error: result.error, code: result.code }
    }

    const authLabel = result.authenticated ? "authenticated session" : "publishable key"
    console.info(`${LOG_PREFIX} CLOUD — loaded ${result.rows.length} row(s) via ${authLabel}`)
    return { ok: true, rows: result.rows }
  }

  return { fetchAll, insert, update, remove, init, LOG_PREFIX }
}
