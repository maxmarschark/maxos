import { createLogPrefix, resolveScopeUserId } from "../../lib/supabase/cloudRepository"
import { transformContact } from "../../lib/supabase/transformers"
import {
  logSupabaseError,
  logSupabasePayload,
  logSupabaseResponse,
} from "../../lib/debug/csvImportDiagnostics"

const LOG_PREFIX = createLogPrefix("Contacts")
const TABLE = "contacts"

export function formatContactsImportError(result, operation) {
  const parts = [result.error ?? "Unknown Supabase error"]
  if (result.code) parts.push(`code=${result.code}`)
  if (result.hint) parts.push(`hint=${result.hint}`)
  if (result.details) parts.push(`details=${result.details}`)

  if (result.code === "PGRST204" || result.code === "42703") {
    parts.push(
      "Run supabase/schema-extensions.sql in the Supabase SQL editor to add missing contacts columns."
    )
  }

  if (result.code === "23503") {
    parts.push("A linked account or brand does not exist in Supabase.")
  }

  return {
    message: `Contact ${operation} failed: ${parts.join(" — ")}`,
    code: result.code,
    hint: result.hint,
    details: result.details,
  }
}

export async function syncCloudContactImportBatch(items, api) {
  const { insertCloudContact, updateCloudContact } = api
  const userId = await resolveScopeUserId()

  for (let index = 0; index < items.length; index++) {
    const { contact, isUpdate } = items[index]
    const operation = isUpdate ? "update" : "insert"
    const payload = transformContact(contact, userId)

    logSupabasePayload({
      operation,
      table: TABLE,
      payload,
      rowIndex: index + 1,
      total: items.length,
    })
    console.log("[Supabase] final payload", payload)

    const result = isUpdate
      ? await updateCloudContact(contact)
      : await insertCloudContact(contact)

    if (result.ok) {
      logSupabaseResponse({
        operation,
        table: TABLE,
        rowIndex: index + 1,
        data: result.contact ?? result.row ?? result,
      })
    } else {
      logSupabaseError({
        operation,
        table: TABLE,
        rowIndex: index + 1,
        error: result,
      })
      const formatted = formatContactsImportError(result, operation)
      console.error(`${LOG_PREFIX} CSV import Supabase ${operation} failed`, {
        row: index + 1,
        total: items.length,
        contactId: contact.id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        accountId: contact.accountId,
        brandId: contact.brandId,
        importBatchId: contact.importBatchId,
        error: result.error,
        code: result.code,
        hint: result.hint,
        details: result.details,
      })
      return {
        ok: false,
        error: formatted.message,
        code: result.code,
        row: index + 1,
        contactId: contact.id,
      }
    }
  }

  return { ok: true }
}
