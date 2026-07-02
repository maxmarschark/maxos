/**
 * Resolves the required Supabase `contacts.name` column. Never returns empty string.
 * Kept in this module (not features/contacts/utils) so production bundles do not
 * cross-import a mis-bound symbol from the main React chunk.
 */
export function resolveContactName(contact) {
  const fullName = String(contact.fullName ?? contact.name ?? "").trim()
  if (fullName) return fullName

  const firstName = String(contact.firstName ?? "").trim()
  const lastName = String(contact.lastName ?? "").trim()
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName

  const company = String(contact.company ?? "").trim()
  if (company) return company

  const email = String(contact.email ?? "").trim()
  if (email) return email

  return "Unknown Contact"
}
