import { getContactName, resolveAccountName } from "./utils"

export function normalizeEmail(email) {
  return (email ?? "").trim().toLowerCase()
}

export function normalizePhone(phone) {
  return (phone ?? "").replace(/\D/g, "")
}

export function getCompanyKey(contact, accounts) {
  const accountName = resolveAccountName(contact.accountId, accounts)
  const company = accountName || contact.company || ""
  return company.trim().toLowerCase()
}

export function getDuplicateReasons(a, b, accounts) {
  const reasons = []
  const emailA = normalizeEmail(a.email)
  const emailB = normalizeEmail(b.email)
  if (emailA && emailB && emailA === emailB) reasons.push("Email")

  const phoneA = normalizePhone(a.phone)
  const phoneB = normalizePhone(b.phone)
  if (phoneA.length >= 7 && phoneA === phoneB) reasons.push("Phone")

  const nameA = getContactName(a).toLowerCase()
  const nameB = getContactName(b).toLowerCase()
  const companyA = getCompanyKey(a, accounts)
  const companyB = getCompanyKey(b, accounts)
  if (nameA && nameB && nameA === nameB && companyA && companyB && companyA === companyB) {
    reasons.push("Name + Company")
  }

  return reasons
}

export function contactsAreDuplicates(a, b, accounts) {
  return getDuplicateReasons(a, b, accounts).length > 0
}

export function findDuplicateMatches(contact, pool, accounts, excludeId) {
  return pool.filter((existing) => {
    if (excludeId && existing.id === excludeId) return false
    return contactsAreDuplicates(contact, existing, accounts)
  })
}

export function detectImportDuplicates(incomingContacts, existingContacts, accounts) {
  const duplicates = []
  const priorIncoming = []

  incomingContacts.forEach((contact, index) => {
    const existingMatches = findDuplicateMatches(contact, existingContacts, accounts)
    const importMatches = findDuplicateMatches(contact, priorIncoming, accounts)
    priorIncoming.push(contact)

    if (existingMatches.length > 0 || importMatches.length > 0) {
      const reasons = new Set()
      existingMatches.forEach((m) =>
        getDuplicateReasons(contact, m, accounts).forEach((r) => reasons.add(r))
      )
      importMatches.forEach((m) =>
        getDuplicateReasons(contact, m, accounts).forEach((r) => reasons.add(`${r} (in file)`))
      )

      duplicates.push({
        index,
        contact,
        existingMatches,
        importMatches,
        reasons: [...reasons],
        targetId: existingMatches[0]?.id ?? null,
      })
    }
  })

  return duplicates
}

export function mergeContactData(existing, incoming) {
  function pick(incomingVal, existingVal) {
    if (incomingVal !== null && incomingVal !== undefined && incomingVal !== "") {
      return incomingVal
    }
    return existingVal
  }

  const mergedNotes = [existing.notes, incoming.notes].filter(Boolean)
  const notes =
    mergedNotes.length > 1
      ? mergedNotes.join("\n\n")
      : mergedNotes[0] ?? ""

  return {
    ...existing,
    firstName: pick(incoming.firstName, existing.firstName),
    lastName: pick(incoming.lastName, existing.lastName),
    accountId: pick(incoming.accountId, existing.accountId),
    brandId: pick(incoming.brandId, existing.brandId),
    company: pick(incoming.company, existing.company),
    role: pick(incoming.role, existing.role),
    type: pick(incoming.type, existing.type),
    phone: pick(incoming.phone, existing.phone),
    email: pick(incoming.email, existing.email),
    preferredContactMethod: pick(
      incoming.preferredContactMethod,
      existing.preferredContactMethod
    ),
    city: pick(incoming.city, existing.city),
    state: pick(incoming.state, existing.state),
    notes,
    lastContactDate: pick(incoming.lastContactDate, existing.lastContactDate),
    nextFollowUpDate: pick(incoming.nextFollowUpDate, existing.nextFollowUpDate),
    updatedAt: new Date().toISOString(),
  }
}
