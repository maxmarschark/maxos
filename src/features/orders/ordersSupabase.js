import { createCloudCrud } from "../../lib/supabase/cloudRepository"
import { parseOrderRow, transformOrder } from "../../lib/supabase/transformers"

const crud = createCloudCrud({
  moduleName: "Orders",
  table: "orders",
  parseRow: parseOrderRow,
  toRow: transformOrder,
})

export const fetchCloudOrders = crud.fetchAll
export const insertCloudOrder = (order) => crud.insert(order).then((r) => (r.ok ? { ok: true, order: r.row } : r))
export const updateCloudOrder = (order) => crud.update(order).then((r) => (r.ok ? { ok: true, order: r.row } : r))
export const deleteCloudOrder = (id) => crud.remove(id)
export async function initCloudOrders() {
  const result = await crud.init()
  return result.ok
    ? { ok: true, orders: result.rows, rows: result.rows, logMessage: result.logMessage }
    : result
}
