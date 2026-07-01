import { createCloudCrud } from "../../lib/supabase/cloudRepository"
import { parseTaskRow, transformTask } from "../../lib/supabase/transformers"

const crud = createCloudCrud({
  moduleName: "Tasks",
  table: "tasks",
  parseRow: parseTaskRow,
  toRow: transformTask,
})

export const fetchCloudTasks = crud.fetchAll
export const insertCloudTask = (task) => crud.insert(task).then((r) => (r.ok ? { ok: true, task: r.row } : r))
export const updateCloudTask = (task) => crud.update(task).then((r) => (r.ok ? { ok: true, task: r.row } : r))
export const deleteCloudTask = (id) => crud.remove(id)
export async function initCloudTasks() {
  const result = await crud.init()
  return result.ok ? { ok: true, tasks: result.rows } : result
}
