import { CONTACT_TYPES, PREFERRED_CONTACT_METHODS } from "./constants"
import { resolveContactName } from "./utils"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const DISPLAY_ONLY_KEYS = new Set([
  "fullName",
  "accountName",
  "brandName",
  "companyDisplay",
  "_duplicateTargetId",
  "_isInFileDuplicate",
])

function isValidUuid(value) {
  return typeof value === "string" && UUID_RE.test(value)
}

function resolveForeignKey(value, allowedIds) {
  if (!isValidUuid(value)) return null
  if (allowedIds && !allowedIds.has(value)) return null
  return value
}

function normalizeType(value) {
  if (!value?.trim()) return "Other"
  const match = CONTACT_TYPES.find((t) => t.toLowerCase() === value.trim().toLowerCase())
  return match ?? "Other"
}

function normalizePreferredMethod(value) {
  return PREFERRED_CONTACT_METHODS.includes(value) ? value : "Email"
}

function normalizeDate(value) {
  if (!value) return null
  const str = String(value).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null
}

/**
 * Strips UI-only CSV fields and coerces values for Supabase insert/update.
 * Invalid account/brand FKs are nulled so company text can still be stored.
 */
export function sanitizeContactForCloud(contact, { accountIds, brandIds } = {}) {
  const accountId = resolveForeignKey(contact.accountId, accountIds)
  const brandId = resolveForeignKey(contact.brandId, brandIds)

  let firstName = String(contact.firstName ?? "").trim()
  let lastName = String(contact.lastName ?? "").trim()
  const fullName = String(contact.fullName ?? contact.name ?? "").trim()
  if (!firstName && !lastName && fullName) {
    const parts = fullName.split(/\s+/)
    firstName = parts[0] ?? ""
    lastName = parts.slice(1).join(" ")
  }

  const cleaned = {
    id: contact.id,
    firstName,
    lastName,
    name: resolveContactName({ ...contact, firstName, lastName }),
    accountId,
    brandId,
    company: accountId ? "" : String(contact.company ?? "").trim(),
    role: String(contact.role ?? "").trim(),
    type: normalizeType(contact.type),
    phone: String(contact.phone ?? "").trim(),
    email: String(contact.email ?? "").trim(),
    preferredContactMethod: normalizePreferredMethod(contact.preferredContactMethod),
    city: String(contact.city ?? "").trim(),
    state: String(contact.state ?? "").trim(),
    notes: String(contact.notes ?? "").trim(),
    lastContactDate: normalizeDate(contact.lastContactDate),
    nextFollowUpDate: normalizeDate(contact.nextFollowUpDate),
    importBatchId: contact.importBatchId ?? null,
    createdAt: contact.createdAt ?? null,
    updatedAt: contact.updatedAt ?? null,
  }

  for (const key of DISPLAY_ONLY_KEYS) {
    if (key in cleaned) delete cleaned[key]
  }

  return cleaned
}

export function sanitizeContactImportBatch(toSync, options) {
  return toSync.map(({ contact, isUpdate }) => ({
    contact: sanitizeContactForCloud(contact, options),
    isUpdate,
  }))
}
