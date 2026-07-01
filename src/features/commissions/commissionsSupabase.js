import { createCloudCrud } from "../../lib/supabase/cloudRepository"
import { parseCommissionRow, transformCommission } from "../../lib/supabase/transformers"

const crud = createCloudCrud({
  moduleName: "Commissions",
  table: "commissions",
  parseRow: parseCommissionRow,
  toRow: transformCommission,
  primaryKey: "order_id",
  orderBy: "order_id",
})

export const fetchCloudCommissions = crud.fetchAll
export const upsertCloudCommission = (meta) =>
  crud.insert(meta).then(async (insertResult) => {
    if (insertResult.ok) return { ok: true, meta: insertResult.row }
    return crud.update(meta).then((r) => (r.ok ? { ok: true, meta: r.row } : r))
  })
export const deleteCloudCommission = (orderId) => crud.remove(orderId)
export async function initCloudCommissions() {
  const result = await crud.init()
  return result.ok ? { ok: true, commissions: result.rows } : result
}
