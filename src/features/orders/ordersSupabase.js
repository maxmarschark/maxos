import {
  probeSupabaseClient,
  resolveScopeUserId,
  createLogPrefix,
  fetchTableRows,
  describeCloudSuccess,
} from "../../lib/supabase/cloudRepository"
import {
  parseOrderRow,
  parseOrderItemRow,
  transformOrder,
  transformOrderItem,
} from "../../lib/supabase/transformers"

const LOG_PREFIX = createLogPrefix("Orders")

function mergeOrdersWithItems(orderRows, itemRows) {
  const byOrder = new Map()
  for (const row of itemRows) {
    const list = byOrder.get(row.order_id) ?? []
    list.push(parseOrderItemRow(row))
    byOrder.set(row.order_id, list)
  }
  return orderRows.map((row) => parseOrderRow(row, byOrder.get(row.id) ?? []))
}

export async function fetchCloudOrders() {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason, table: "orders" }

  const userId = await resolveScopeUserId()
  const { data: orderRows, error } = await fetchTableRows(probe.supabase, {
    table: "orders",
    orderBy: "updated_at",
    fallbackOrderBy: "id",
    userId,
    logPrefix: LOG_PREFIX,
  })
  if (error) return { ok: false, error: error.message, code: error.code, table: "orders" }

  let itemQuery = probe.supabase.from("order_items").select("*")
  if (userId) itemQuery = itemQuery.eq("user_id", userId)
  const { data: itemRows, error: itemError } = await itemQuery
  if (itemError) {
    console.warn(
      `${LOG_PREFIX} order_items fetch failed (${itemError.message}) — orders loaded without line items`
    )
  }

  const orders = mergeOrdersWithItems(orderRows ?? [], itemRows ?? [])
  return {
    ok: true,
    orders,
    authenticated: Boolean(userId),
    rows: orders,
  }
}

async function syncOrderItems(order, userId) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  await probe.supabase.from("order_items").delete().eq("order_id", order.id)
  if (order.lineItems?.length) {
    const rows = order.lineItems.map((item) =>
      transformOrderItem(item, order.id, order.brandId, userId)
    )
    const { error } = await probe.supabase.from("order_items").insert(rows)
    if (error) {
      console.warn(`${LOG_PREFIX} order_items insert failed:`, error.message)
      return { ok: false, error: error.message, code: error.code }
    }
  }
  return { ok: true }
}

async function fetchOrderWithItems(orderRow, userId) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) {
    return parseOrderRow(orderRow, [])
  }

  let query = probe.supabase.from("order_items").select("*").eq("order_id", orderRow.id)
  if (userId) query = query.eq("user_id", userId)
  const { data: itemRows, error } = await query
  if (error) {
    console.warn(`${LOG_PREFIX} order_items fetch failed after save:`, error.message)
    return parseOrderRow(orderRow, [])
  }

  return parseOrderRow(orderRow, itemRows ?? [])
}

export async function insertCloudOrder(order) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to save to Supabase", code: "not_authenticated" }
  }

  const row = transformOrder(order, userId)
  const { data, error } = await probe.supabase.from("orders").insert(row).select().single()
  if (error) return { ok: false, error: error.message }

  const syncResult = await syncOrderItems(order, userId)
  if (!syncResult.ok) {
    return { ok: false, error: syncResult.error, code: syncResult.code }
  }

  const saved = await fetchOrderWithItems(data, userId)
  return { ok: true, order: saved }
}

export async function updateCloudOrder(order) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to save to Supabase", code: "not_authenticated" }
  }

  const row = transformOrder(order, userId)
  const { data, error } = await probe.supabase
    .from("orders")
    .update(row)
    .eq("id", order.id)
    .select()
    .single()
  if (error) return { ok: false, error: error.message }

  const syncResult = await syncOrderItems(order, userId)
  if (!syncResult.ok) {
    return { ok: false, error: syncResult.error, code: syncResult.code }
  }

  const saved = await fetchOrderWithItems(data, userId)
  return { ok: true, order: saved }
}

export async function deleteCloudOrder(id) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to save to Supabase", code: "not_authenticated" }
  }

  await probe.supabase.from("order_items").delete().eq("order_id", id)
  const { error } = await probe.supabase.from("orders").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }

  return { ok: true }
}

export async function initCloudOrders() {
  const probe = await probeSupabaseClient()
  if (!probe.ok) {
    return { ok: false, reason: probe.reason, table: "orders" }
  }

  const { error: tableError } = await probe.supabase.from("orders").select("id").limit(1)
  if (tableError) {
    return {
      ok: false,
      reason: "fetch_failed",
      error: tableError.message,
      code: tableError.code,
      table: "orders",
    }
  }

  const result = await fetchCloudOrders()
  if (!result.ok) {
    return { ok: false, reason: "fetch_failed", error: result.error, code: result.code, table: "orders" }
  }

  return {
    ok: true,
    orders: result.orders,
    rows: result.orders,
    authenticated: result.authenticated,
    logMessage: describeCloudSuccess(result),
  }
}
