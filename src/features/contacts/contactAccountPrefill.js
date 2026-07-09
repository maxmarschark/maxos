import { EMPTY_CONTACT } from "./constants"

export function isBlank(value) {
  return !String(value ?? "").trim()
}

export function splitFullName(fullName) {
  const parts = String(fullName ?? "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: "", lastName: "" }
  if (parts.length === 1) return { firstName: parts[0], lastName: "" }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") }
}

function fieldsEmptyForPrefill(form) {
  return (
    isBlank(form.firstName) &&
    isBlank(form.lastName) &&
    isBlank(form.phone) &&
    isBlank(form.email) &&
    isBlank(form.city)
  )
}

export function applyAccountFieldsToForm(form, account) {
  if (!account) return form

  const next = { ...form, accountId: account.id }
  const fresh = fieldsEmptyForPrefill(form)

  if (fresh || isBlank(next.company)) next.company = account.businessName
  if (fresh || isBlank(next.phone)) next.phone = account.phone ?? ""
  if (fresh || isBlank(next.email)) next.email = account.email ?? ""
  if (fresh || isBlank(next.city)) next.city = account.city ?? ""
  if (fresh) {
    next.state = account.state || next.state
  }

  return next
}

export function buildContactSeedFromAccount(account, { includeCreatedNote = true } = {}) {
  const { firstName, lastName } = splitFullName(account.owner)
  return {
    ...EMPTY_CONTACT,
    accountId: account.id,
    company: account.businessName,
    firstName,
    lastName,
    phone: account.phone ?? "",
    email: account.email ?? "",
    city: account.city ?? "",
    state: account.state || "TX",
    type: "Buyer",
    notes: includeCreatedNote ? `Created from account: ${account.businessName}` : "",
  }
}

export function buildPrimaryContactFromAccount(account, primaryContact) {
  const { firstName, lastName } = splitFullName(
    primaryContact.name || account.owner
  )
  return {
    ...EMPTY_CONTACT,
    accountId: account.id,
    company: account.businessName,
    firstName,
    lastName,
    role: primaryContact.role?.trim() ?? "",
    phone: primaryContact.phone?.trim() || account.phone || "",
    email: primaryContact.email?.trim() || account.email || "",
    city: account.city ?? "",
    state: account.state || "TX",
    type: primaryContact.role?.toLowerCase().includes("owner") ? "Owner" : "Buyer",
    notes: `Created from account: ${account.businessName}`,
  }
}

export function findDuplicateContactForAccount(contacts, { accountId, email }) {
  const normalized = email?.trim().toLowerCase()
  if (!accountId || !normalized) return null
  return (
    contacts.find(
      (contact) =>
        contact.accountId === accountId &&
        contact.email?.trim().toLowerCase() === normalized
    ) ?? null
  )
}
