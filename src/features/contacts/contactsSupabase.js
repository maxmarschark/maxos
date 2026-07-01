import { createCloudCrud } from "../../lib/supabase/cloudRepository"
import { parseContactRow, transformContact } from "../../lib/supabase/transformers"

const crud = createCloudCrud({
  moduleName: "Contacts",
  table: "contacts",
  parseRow: parseContactRow,
  toRow: transformContact,
})

export const fetchCloudContacts = crud.fetchAll
export const insertCloudContact = (contact) => crud.insert(contact).then((r) => (r.ok ? { ok: true, contact: r.row } : r))
export const updateCloudContact = (contact) => crud.update(contact).then((r) => (r.ok ? { ok: true, contact: r.row } : r))
export const deleteCloudContact = (id) => crud.remove(id)
export async function initCloudContacts() {
  const result = await crud.init()
  return result.ok
    ? { ok: true, contacts: result.rows, rows: result.rows, logMessage: result.logMessage }
    : result
}
