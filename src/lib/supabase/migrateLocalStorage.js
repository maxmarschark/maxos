import { loadAllAppData } from "../maxOsStorage"
import { getSupabaseClient } from "./client"
import { isSupabaseConfigured } from "./env"
import { transformLocalDataForSupabase } from "./transformers"

export const MIGRATION_FORMAT_VERSION = 1

const UPLOAD_ORDER = [
  "brands",
  "accounts",
  "brand_products",
  "contacts",
  "orders",
  "commissions",
  "tasks",
  "activity_events",
  "deals",
  "calendar_events",
]

/**
 * Read all Max OS module data from localStorage (same keys as backup/restore).
 */
export function readLocalStorageForMigration() {
  return loadAllAppData()
}

/**
 * Transform localStorage-shaped data into Supabase row payloads (snake_case).
 */
export function prepareMigrationPayload({ userId, data = readLocalStorageForMigration() } = {}) {
  if (!userId) {
    throw new Error("userId is required — use the authenticated Supabase user UUID")
  }

  const tables = transformLocalDataForSupabase(data, { userId })

  return {
    version: MIGRATION_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    source: "localStorage",
    userId,
    counts: Object.fromEntries(
      Object.entries(tables).map(([table, rows]) => [table, rows.length])
    ),
    tables,
  }
}

export function serializeMigrationPayload(payload) {
  return JSON.stringify(payload, null, 2)
}

/**
 * Trigger a browser download of the migration JSON file.
 */
export function downloadMigrationPayload(options = {}) {
  const payload = prepareMigrationPayload(options)
  const json = serializeMigrationPayload(payload)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `max-os-supabase-migration-${stamp}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  return payload
}

async function upsertTable(supabase, table, rows, { onConflict }) {
  if (rows.length === 0) return { table, count: 0, error: null }

  const { error } = await supabase.from(table).upsert(rows, { onConflict })
  return { table, count: rows.length, error: error?.message ?? null }
}

/**
 * Upload a prepared migration payload to Supabase.
 * Requires VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY and an authenticated session
 * (RLS policies expect auth.uid() = user_id).
 */
export async function uploadMigrationPayload(payload, { onTableComplete } = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    )
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client")
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw new Error(`Supabase auth error: ${authError.message}`)
  }

  if (!user) {
    throw new Error("Sign in to Supabase before uploading migration data")
  }

  if (payload.userId && payload.userId !== user.id) {
    throw new Error(
      "Migration payload userId does not match the signed-in Supabase user"
    )
  }

  const results = []
  const tables = payload.tables ?? payload

  for (const table of UPLOAD_ORDER) {
    const rows = tables[table] ?? []
    const onConflict = table === "commissions" ? "order_id" : "id"
    const normalizedRows = rows.map((row) => ({
      ...row,
      user_id: user.id,
    }))
    const result = await upsertTable(supabase, table, normalizedRows, { onConflict })
    results.push(result)
    onTableComplete?.(result)
    if (result.error) {
      return { ok: false, results, failedAt: table }
    }
  }

  return { ok: true, results }
}

/**
 * One-step helper: read localStorage, transform, and upload to Supabase.
 */
export async function migrateLocalStorageToSupabase(options = {}) {
  const payload = prepareMigrationPayload(options)
  return uploadMigrationPayload(payload, options)
}
