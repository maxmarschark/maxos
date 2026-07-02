import {
  probeSupabaseClient,
  resolveScopeUserId,
  createLogPrefix,
  fetchTableRows,
  describeCloudSuccess,
} from "../../lib/supabase/cloudRepository"
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
  if (!probe.ok) return { ok: false, error: probe.reason, table: "brands" }

  const userId = await resolveScopeUserId()
  const { data: brandRows, error } = await fetchTableRows(probe.supabase, {
    table: "brands",
    orderBy: "updated_at",
    fallbackOrderBy: "id",
    userId,
    logPrefix: LOG_PREFIX,
  })
  if (error) return { ok: false, error: error.message, code: error.code, table: "brands" }

  let productQuery = probe.supabase.from("brand_products").select("*")
  if (userId) productQuery = productQuery.eq("user_id", userId)
  const { data: productRows, error: productError } = await productQuery
  if (productError) {
    console.warn(
      `${LOG_PREFIX} brand_products fetch failed (${productError.message}) — brands loaded without products`
    )
  }

  return {
    ok: true,
    brands: mergeBrandsWithProducts(brandRows ?? [], productRows ?? []),
    authenticated: Boolean(userId),
    rows: mergeBrandsWithProducts(brandRows ?? [], productRows ?? []),
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
  if (!userId) {
    return { ok: false, error: "Sign in required to save to Supabase", code: "not_authenticated" }
  }

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
  if (!userId) {
    return { ok: false, error: "Sign in required to save to Supabase", code: "not_authenticated" }
  }

  const row = transformBrand(brand, userId)
  const query = probe.supabase.from("brands").update(row).eq("id", brand.id).eq("user_id", userId)
  const { data, error } = await query.select().single()
  if (error) return { ok: false, error: error.message }

  await syncBrandProducts(brand, userId)
  return { ok: true, brand: parseBrandRow(data, brand.products ?? []) }
}

export async function deleteCloudBrand(brandId) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to save to Supabase", code: "not_authenticated" }
  }

  await probe.supabase.from("brand_products").delete().eq("brand_id", brandId)
  const query = probe.supabase.from("brands").delete().eq("id", brandId).eq("user_id", userId)
  const { error } = await query
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function initCloudBrands() {
  const probe = await probeSupabaseClient()
  if (!probe.ok) {
    return { ok: false, reason: probe.reason, table: "brands" }
  }

  const { error: tableError } = await probe.supabase.from("brands").select("id").limit(1)
  if (tableError) {
    return {
      ok: false,
      reason: "fetch_failed",
      error: tableError.message,
      code: tableError.code,
      table: "brands",
    }
  }

  const result = await fetchCloudBrands()
  if (!result.ok) {
    return { ok: false, reason: "fetch_failed", error: result.error, code: result.code, table: "brands" }
  }

  return {
    ok: true,
    brands: result.brands,
    rows: result.brands,
    authenticated: result.authenticated,
    logMessage: describeCloudSuccess(result),
  }
}
