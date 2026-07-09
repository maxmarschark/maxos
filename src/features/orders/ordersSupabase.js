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
import { prepareOrderForSave } from "./orderBuilder"
import { traceOrderAmount } from "./orderSaveTrace"

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

  const orderId = order.id
  if (!orderId) {
    return { ok: false, error: "Order id is required to sync line items" }
  }

  await probe.supabase.from("order_items").delete().eq("order_id", orderId)
  if (order.lineItems?.length) {
    const rows = order.lineItems.map((item) =>
      transformOrderItem(item, orderId, order.brandId, userId)
    )
    console.info(`${LOG_PREFIX} syncing ${rows.length} line item(s) for order ${orderId}`, rows)
    const { data, error } = await probe.supabase.from("order_items").insert(rows).select()
    if (error) {
      console.warn(`${LOG_PREFIX} order_items insert failed:`, error.message, { rows })
      return { ok: false, error: error.message, code: error.code }
    }
    console.info(`${LOG_PREFIX} order_items saved`, data)
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

  traceOrderAmount("3 ordersSupabase.insertCloudOrder received", order)

  const prepared = prepareOrderForSave(order)
  traceOrderAmount("3b ordersSupabase.insertCloudOrder prepared", prepared)

  const row = transformOrder(prepared, userId)
  console.info(`${LOG_PREFIX} 4 transformOrder row before insert`, {
    order_amount: row.order_amount,
    subtotal_amount: row.subtotal_amount,
    discount_amount: row.discount_amount,
    commission_amount: row.commission_amount,
    commission_percent: row.commission_percent,
    row,
  })

  const { data, error } = await probe.supabase.from("orders").insert(row).select().single()
  if (error) {
    console.error(`${LOG_PREFIX} order insert failed:`, error.message, { row })
    return { ok: false, error: error.message, code: error.code }
  }

  console.info(`${LOG_PREFIX} 5 Supabase insert response`, {
    order_amount: data?.order_amount,
    subtotal_amount: data?.subtotal_amount,
    discount_amount: data?.discount_amount,
    commission_amount: data?.commission_amount,
    commission_percent: data?.commission_percent,
    data,
  })

  const orderForSync = { ...prepared, id: data.id ?? prepared.id }
  const syncResult = await syncOrderItems(orderForSync, userId)
  if (!syncResult.ok) {
    return { ok: false, error: syncResult.error, code: syncResult.code }
  }

  const saved = await fetchOrderWithItems(data, userId)
  traceOrderAmount("6 parseOrderRow after insert", saved, {
    parsedFromOrderAmount: saved.orderAmount,
    supabaseOrderAmount: data?.order_amount,
    orderItemsInserted: Boolean(syncResult.ok),
  })
  return { ok: true, order: saved }
}

export async function updateCloudOrder(order) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to save to Supabase", code: "not_authenticated" }
  }

  const prepared = prepareOrderForSave(order)
  const row = transformOrder(prepared, userId)
  console.info(`${LOG_PREFIX} updating order ${prepared.id}`, row)

  const { data, error } = await probe.supabase
    .from("orders")
    .update(row)
    .eq("id", prepared.id)
    .eq("user_id", userId)
    .select()
    .single()
  if (error) {
    console.error(`${LOG_PREFIX} order update failed:`, error.message, { row })
    return { ok: false, error: error.message, code: error.code }
  }

  console.info(`${LOG_PREFIX} order update response`, data)

  const orderForSync = { ...prepared, id: data.id ?? prepared.id }
  const syncResult = await syncOrderItems(orderForSync, userId)
  if (!syncResult.ok) {
    return { ok: false, error: syncResult.error, code: syncResult.code }
  }

  const saved = await fetchOrderWithItems(data, userId)
  console.info(`${LOG_PREFIX} saved order with items`, saved)
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
