import { getDatedFileName, downloadJson } from "../../lib/csv"
import {
  APP_VERSION,
  BACKUP_FORMAT_VERSION,
  loadAllAppData,
  setLastBackupDate,
  countAccountTasks,
  MAX_OS_DATA_KEYS,
} from "../../lib/maxOsStorage"
import { saveToStorage } from "../../lib/storage"

export function getBackupFileName() {
  return getDatedFileName("max-os-backup", "json")
}

export function createBackupPayload() {
  const data = loadAllAppData()
  return {
    version: BACKUP_FORMAT_VERSION,
    app: "max-os",
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
}

export function exportBackup() {
  const payload = createBackupPayload()
  downloadJson(payload, getBackupFileName())
  setLastBackupDate(payload.exportedAt)
  return payload
}

const DATA_FIELDS = [
  "accounts",
  "contacts",
  "brands",
  "orders",
  "commissions",
  "importBatches",
]

export function validateBackup(raw) {
  const errors = []

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { valid: false, errors: ["Backup file must be a JSON object."] }
  }

  if (raw.app !== "max-os") {
    errors.push('Backup must be from Max OS (missing or invalid "app" field).')
  }

  if (typeof raw.version !== "number" || raw.version < 1) {
    errors.push("Unsupported or missing backup version.")
  }

  if (!raw.data || typeof raw.data !== "object" || Array.isArray(raw.data)) {
    errors.push('Backup must include a "data" object.')
  } else {
    for (const field of DATA_FIELDS) {
      if (raw.data[field] != null && !Array.isArray(raw.data[field])) {
        errors.push(`"${field}" must be an array.`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

export function getBackupPreview(raw) {
  const data = raw?.data ?? {}
  const accounts = Array.isArray(data.accounts) ? data.accounts : []
  const contacts = Array.isArray(data.contacts) ? data.contacts : []
  const brands = Array.isArray(data.brands) ? data.brands : []
  const orders = Array.isArray(data.orders) ? data.orders : []
  const commissions = Array.isArray(data.commissions) ? data.commissions : []
  const importBatches = Array.isArray(data.importBatches) ? data.importBatches : []

  return {
    accounts: accounts.length,
    contacts: contacts.length,
    brands: brands.length,
    orders: orders.length,
    commissions: commissions.length,
    importBatches: importBatches.length,
    tasks: countAccountTasks(accounts),
    exportedAt: raw?.exportedAt ?? null,
    appVersion: raw?.appVersion ?? null,
  }
}

export function restoreBackup(raw) {
  const validation = validateBackup(raw)
  if (!validation.valid) {
    throw new Error(validation.errors.join(" "))
  }

  const data = raw.data

  saveToStorage(MAX_OS_DATA_KEYS.accounts, data.accounts ?? [])
  saveToStorage(MAX_OS_DATA_KEYS.contacts, data.contacts ?? [])
  saveToStorage(MAX_OS_DATA_KEYS.brands, data.brands ?? [])
  saveToStorage(MAX_OS_DATA_KEYS.orders, data.orders ?? [])
  saveToStorage(MAX_OS_DATA_KEYS.commissions, data.commissions ?? [])
  saveToStorage(MAX_OS_DATA_KEYS.importBatches, data.importBatches ?? [])

  setLastBackupDate(new Date().toISOString())
}

export function parseBackupFile(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("Invalid JSON file.")
  }
  return parsed
}

export function clearAllAppData() {
  for (const key of Object.values(MAX_OS_DATA_KEYS)) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }
}
