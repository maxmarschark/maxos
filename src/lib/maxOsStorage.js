import { ACCOUNTS_STORAGE_KEY } from "../features/accounts/constants"
import { BRANDS_STORAGE_KEY } from "../features/brands/constants"
import { CONTACTS_STORAGE_KEY, IMPORT_BATCHES_STORAGE_KEY } from "../features/contacts/constants"
import { ORDERS_STORAGE_KEY } from "../features/orders/constants"
import { COMMISSIONS_STORAGE_KEY } from "../features/commissions/constants"
import { loadFromStorage, saveToStorage } from "./storage"

export const APP_VERSION = "Max OS Local MVP v0.1.0"
export const BACKUP_FORMAT_VERSION = 1
export const LAST_BACKUP_KEY = "max-os-last-backup"

/** App data keys included in backup, restore, and clear-all. */
export const MAX_OS_DATA_KEYS = {
  accounts: ACCOUNTS_STORAGE_KEY,
  contacts: CONTACTS_STORAGE_KEY,
  brands: BRANDS_STORAGE_KEY,
  orders: ORDERS_STORAGE_KEY,
  commissions: COMMISSIONS_STORAGE_KEY,
  importBatches: IMPORT_BATCHES_STORAGE_KEY,
}

export const ALL_DATA_STORAGE_KEYS = Object.values(MAX_OS_DATA_KEYS)

export function loadAllAppData() {
  return {
    accounts: loadFromStorage(MAX_OS_DATA_KEYS.accounts, []),
    contacts: loadFromStorage(MAX_OS_DATA_KEYS.contacts, []),
    brands: loadFromStorage(MAX_OS_DATA_KEYS.brands, []),
    orders: loadFromStorage(MAX_OS_DATA_KEYS.orders, []),
    commissions: loadFromStorage(MAX_OS_DATA_KEYS.commissions, []),
    importBatches: loadFromStorage(MAX_OS_DATA_KEYS.importBatches, []),
  }
}

export function getLastBackupDate() {
  return loadFromStorage(LAST_BACKUP_KEY, null)
}

export function setLastBackupDate(isoDate = new Date().toISOString()) {
  saveToStorage(LAST_BACKUP_KEY, isoDate)
}

export function estimateStorageUsageBytes() {
  let total = 0
  for (const key of ALL_DATA_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) total += raw.length * 2
    } catch {
      /* ignore */
    }
  }
  return total
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function countAccountTasks(accounts) {
  return accounts.reduce((sum, a) => sum + (a.tasks?.length ?? 0), 0)
}
