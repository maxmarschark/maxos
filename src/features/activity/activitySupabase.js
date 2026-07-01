import { createCloudCrud } from "../../lib/supabase/cloudRepository"
import { parseActivityEventRow, transformActivityEvent } from "../../lib/supabase/transformers"

const crud = createCloudCrud({
  moduleName: "Activity",
  table: "activity_events",
  parseRow: parseActivityEventRow,
  toRow: transformActivityEvent,
  orderBy: "occurred_at",
})

export const fetchCloudActivityEvents = crud.fetchAll
export const insertCloudActivityEvent = (event) =>
  crud.insert(event).then((r) => (r.ok ? { ok: true, event: r.row } : r))
export async function initCloudActivity() {
  const result = await crud.init()
  return result.ok
    ? { ok: true, events: result.rows, rows: result.rows, logMessage: result.logMessage }
    : result
}
