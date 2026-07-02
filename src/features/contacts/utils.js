import { loadFromStorage } from "../../lib/storage"
import { ACCOUNTS_STORAGE_KEY } from "../accounts/constants"
import { SEED_ACCOUNTS } from "../accounts/seed"
import { BRANDS_STORAGE_KEY } from "../brands/constants"
import { SEED_BRANDS } from "../brands/seed"
import { CONTACT_TYPES } from "./constants"

export function loadAccountsForContacts() {
  return loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS)
}

export function loadBrandsForContacts() {
  return loadFromStorage(BRANDS_STORAGE_KEY, SEED_BRANDS)
}

export function resolveAccountName(accountId, accounts) {
  if (!accountId) return null
  return accounts.find((a) => a.id === accountId)?.businessName ?? null
}

export function resolveBrandName(brandId, brands) {
  if (!brandId) return null
  return brands.find((b) => b.id === brandId)?.brandName ?? null
}

export function getContactName(contact) {
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ")
  return name || contact.name || contact.fullName || "—"
}

export { resolveContactName } from "../../lib/supabase/contactName"

export function enrichContact(contact, accounts, brands) {
  const accountName = resolveAccountName(contact.accountId, accounts)
  const brandName = resolveBrandName(contact.brandId, brands)
  return {
    ...contact,
    fullName: getContactName(contact),
    accountName,
    brandName,
    companyDisplay: accountName || contact.company || "—",
  }
}

export function enrichContacts(contacts, accounts, brands) {
  return contacts.map((c) => enrichContact(c, accounts, brands))
}

export function findAccountByName(accounts, name) {
  if (!name?.trim()) return null
  const q = name.trim().toLowerCase()
  return accounts.find((a) => a.businessName.toLowerCase() === q) ?? null
}

export function findBrandByName(brands, name) {
  if (!name?.trim()) return null
  const q = name.trim().toLowerCase()
  return brands.find((b) => b.brandName.toLowerCase() === q) ?? null
}

export function normalizeContactType(value) {
  if (!value?.trim()) return "Other"
  const match = CONTACT_TYPES.find(
    (t) => t.toLowerCase() === value.trim().toLowerCase()
  )
  return match ?? "Other"
}
