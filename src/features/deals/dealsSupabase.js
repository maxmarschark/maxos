import { createCloudCrud } from "../../lib/supabase/cloudRepository"
import { parseDealRow, transformDeal } from "../../lib/supabase/transformers"

const crud = createCloudCrud({
  moduleName: "Deals",
  table: "deals",
  parseRow: parseDealRow,
  toRow: transformDeal,
})

export const insertCloudDeal = (deal) => crud.insert(deal).then((r) => (r.ok ? { ok: true, deal: r.row } : r))
export const updateCloudDeal = (deal) => crud.update(deal).then((r) => (r.ok ? { ok: true, deal: r.row } : r))
export const deleteCloudDeal = (id) => crud.remove(id)
export async function initCloudDeals() {
  const result = await crud.init()
  return result.ok ? { ok: true, deals: result.rows } : result
}
