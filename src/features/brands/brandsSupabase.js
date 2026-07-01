import { probeSupabaseClient, resolveScopeUserId, createLogPrefix } from "../../lib/supabase/cloudRepository"
import {
  parseBrandRow,
  parseBrandProductRow,
  transformBrand,
  transformBrandProduct,
} from "../../lib/supabase/transformers"

const LOG_PREFIX = createLogPrefix("Brands")

function mergeBrandsWithProducts(brandRows, productRows) {
  const byBrand = new Map()
  for (const row of productRows) {
    const list = byBrand.get(row.brand_id) ?? []
    list.push(parseBrandProductRow(row))
    byBrand.set(row.brand_id, list)
  }
  return brandRows.map((row) => parseBrandRow(row, byBrand.get(row.id) ?? []))
}

export async function fetchCloudBrands() {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  let brandQuery = probe.supabase
    .from("brands")
    .select("*")
    .order("updated_at", { ascending: false, nullsFirst: false })
  if (userId) brandQuery = brandQuery.eq("user_id", userId)

  const { data: brandRows, error } = await brandQuery
  if (error) return { ok: false, error: error.message, code: error.code }

  let productQuery = probe.supabase.from("brand_products").select("*")
  if (userId) productQuery = productQuery.eq("user_id", userId)
  const { data: productRows } = await productQuery

  return {
    ok: true,
    brands: mergeBrandsWithProducts(brandRows ?? [], productRows ?? []),
    authenticated: Boolean(userId),
  }
}

async function syncBrandProducts(brand, userId) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  await probe.supabase.from("brand_products").delete().eq("brand_id", brand.id)
  if (brand.products?.length) {
    const rows = brand.products.map((p) => transformBrandProduct(p, brand.id, userId))
    const { error } = await probe.supabase.from("brand_products").insert(rows)
    if (error) return { ok: false, error: error.message }
  }
  return { ok: true }
}

export async function insertCloudBrand(brand) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  const row = transformBrand(brand, userId)
  const { data, error } = await probe.supabase.from("brands").insert(row).select().single()
  if (error) return { ok: false, error: error.message }

  await syncBrandProducts(brand, userId)
  const refreshed = await fetchCloudBrands()
  const saved = refreshed.ok ? refreshed.brands.find((b) => b.id === brand.id) : parseBrandRow(data, brand.products ?? [])
  return { ok: true, brand: saved ?? parseBrandRow(data, brand.products ?? []) }
}

export async function updateCloudBrand(brand) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  const row = transformBrand(brand, userId)
  let query = probe.supabase.from("brands").update(row).eq("id", brand.id)
  if (userId) query = query.eq("user_id", userId)
  const { data, error } = await query.select().single()
  if (error) return { ok: false, error: error.message }

  await syncBrandProducts(brand, userId)
  return { ok: true, brand: parseBrandRow(data, brand.products ?? []) }
}

export async function deleteCloudBrand(brandId) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  await probe.supabase.from("brand_products").delete().eq("brand_id", brandId)
  let query = probe.supabase.from("brands").delete().eq("id", brandId)
  if (userId) query = query.eq("user_id", userId)
  const { error } = await query
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function initCloudBrands() {
  const probe = await probeSupabaseClient()
  if (!probe.ok) {
    console.info(`${LOG_PREFIX} LOCAL — Supabase not configured`)
    return { ok: false, reason: probe.reason }
  }

  const { error: tableError } = await probe.supabase.from("brands").select("id").limit(1)
  if (tableError) {
    console.error(`${LOG_PREFIX} LOCAL — database error:`, tableError.message)
    return { ok: false, reason: "fetch_failed", error: tableError.message }
  }

  const result = await fetchCloudBrands()
  if (!result.ok) {
    console.error(`${LOG_PREFIX} LOCAL — database error:`, result.error)
    return { ok: false, reason: "fetch_failed", error: result.error }
  }

  console.info(`${LOG_PREFIX} CLOUD — loaded ${result.brands.length} brand(s)`)
  return { ok: true, brands: result.brands }
}
