import { createCloudCrud } from "../../lib/supabase/cloudRepository"
import { parseCalendarEventRow, transformCalendarEvent } from "../../lib/supabase/transformers"

const crud = createCloudCrud({
  moduleName: "Calendar",
  table: "calendar_events",
  parseRow: parseCalendarEventRow,
  toRow: transformCalendarEvent,
  orderBy: "event_date",
})

export const insertCloudCalendarEvent = (event) =>
  crud.insert(event).then((r) => (r.ok ? { ok: true, event: r.row } : r))
export const updateCloudCalendarEvent = (event) =>
  crud.update(event).then((r) => (r.ok ? { ok: true, event: r.row } : r))
export const deleteCloudCalendarEvent = (id) => crud.remove(id)
export async function initCloudCalendar() {
  const result = await crud.init()
  return result.ok ? { ok: true, events: result.rows } : result
}
