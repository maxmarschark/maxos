import { generateId } from "../../lib/id"
import {
  probeSupabaseClient,
  resolveScopeUserId,
  createLogPrefix,
} from "../../lib/supabase/cloudRepository"
import { BRAND_FILES_BUCKET } from "./constants"
import { buildStoragePath } from "./utils"

const LOG_PREFIX = createLogPrefix("BrandFiles")

function parseTagsFromRow(value) {
  if (Array.isArray(value)) return value
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((t) => t.trim()).filter(Boolean)
  }
  return []
}

function parseBrandFileRow(row) {
  return {
    id: row.id,
    brandId: row.brand_id,
    fileName: row.file_name,
    filePath: row.file_path,
    fileType: row.file_type,
    fileSize: Number(row.file_size) || 0,
    category: row.category,
    uploadedAt: row.uploaded_at,
    notes: row.notes ?? "",
    version: row.version ?? "",
    isFeatured: Boolean(row.is_featured),
    tags: parseTagsFromRow(row.tags),
  }
}

function transformBrandFileInsert(file, userId) {
  const row = {
    id: file.id,
    user_id: userId,
    brand_id: file.brandId,
    file_name: file.fileName,
    file_path: file.filePath,
    file_type: file.fileType,
    file_size: file.fileSize,
    category: file.category,
    uploaded_at: file.uploadedAt,
    notes: file.notes ?? "",
  }

  if (file.version) row.version = file.version
  if (file.isFeatured) row.is_featured = true
  if (file.tags?.length) row.tags = file.tags

  return row
}

export async function fetchBrandFiles(brandId) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  let query = probe.supabase
    .from("brand_files")
    .select("*")
    .eq("brand_id", brandId)
    .order("uploaded_at", { ascending: false })

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query
  if (error) {
    console.warn(`${LOG_PREFIX} fetch failed:`, error.message)
    return { ok: false, error: error.message, code: error.code }
  }

  return { ok: true, files: (data ?? []).map(parseBrandFileRow) }
}

export async function uploadBrandFile({
  brandId,
  file,
  category,
  notes = "",
  version = "",
  tags = [],
}) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to upload files", code: "not_authenticated" }
  }

  const filePath = buildStoragePath(brandId, file.name)
  const { error: uploadError } = await probe.supabase.storage
    .from(BRAND_FILES_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    })

  if (uploadError) {
    console.warn(`${LOG_PREFIX} storage upload failed:`, uploadError.message)
    return { ok: false, error: uploadError.message }
  }

  const now = new Date().toISOString()
  const record = {
    id: generateId(),
    brandId,
    fileName: file.name,
    filePath,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    category,
    uploadedAt: now,
    notes: notes.trim(),
    version: version.trim(),
    isFeatured: false,
    tags,
  }

  const { data, error: insertError } = await probe.supabase
    .from("brand_files")
    .insert(transformBrandFileInsert(record, userId))
    .select()
    .single()

  if (insertError) {
    await probe.supabase.storage.from(BRAND_FILES_BUCKET).remove([filePath])
    console.warn(`${LOG_PREFIX} metadata insert failed:`, insertError.message)
    return { ok: false, error: insertError.message, code: insertError.code }
  }

  return { ok: true, file: parseBrandFileRow(data) }
}

export async function deleteBrandFile(file) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to delete files", code: "not_authenticated" }
  }

  const { error: storageError } = await probe.supabase.storage
    .from(BRAND_FILES_BUCKET)
    .remove([file.filePath])

  if (storageError) {
    console.warn(`${LOG_PREFIX} storage delete failed:`, storageError.message)
    return { ok: false, error: storageError.message }
  }

  const { error } = await probe.supabase
    .from("brand_files")
    .delete()
    .eq("id", file.id)
    .eq("user_id", userId)

  if (error) {
    console.warn(`${LOG_PREFIX} metadata delete failed:`, error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function getBrandFileSignedUrl(filePath, expiresIn = 3600) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to access files", code: "not_authenticated" }
  }

  const { data, error } = await probe.supabase.storage
    .from(BRAND_FILES_BUCKET)
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    console.warn(`${LOG_PREFIX} signed URL failed:`, error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true, url: data.signedUrl }
}

export async function updateBrandFileMetadata(file, updates) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to update files", code: "not_authenticated" }
  }

  const payload = {}
  if (updates.notes !== undefined) payload.notes = updates.notes.trim()
  if (updates.version !== undefined) payload.version = updates.version.trim()
  if (updates.tags !== undefined) payload.tags = updates.tags

  const { data, error } = await probe.supabase
    .from("brand_files")
    .update(payload)
    .eq("id", file.id)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: error.message, code: error.code }
  }

  return { ok: true, file: parseBrandFileRow(data) }
}

/** @deprecated Use updateBrandFileMetadata */
export async function updateBrandFileNotes(file, notes) {
  return updateBrandFileMetadata(file, { notes })
}

export async function setFeaturedBrandFile(brandId, fileId) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to update files", code: "not_authenticated" }
  }

  const clearQuery = probe.supabase
    .from("brand_files")
    .update({ is_featured: false })
    .eq("brand_id", brandId)
    .eq("user_id", userId)

  const { error: clearError } = await clearQuery
  if (clearError) {
    return { ok: false, error: clearError.message, code: clearError.code }
  }

  const { data, error } = await probe.supabase
    .from("brand_files")
    .update({ is_featured: true })
    .eq("id", fileId)
    .eq("brand_id", brandId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: error.message, code: error.code }
  }

  return { ok: true, file: parseBrandFileRow(data) }
}

export async function clearFeaturedBrandFile(brandId) {
  const probe = await probeSupabaseClient()
  if (!probe.ok) return { ok: false, error: probe.reason }

  const userId = await resolveScopeUserId()
  if (!userId) {
    return { ok: false, error: "Sign in required to update files", code: "not_authenticated" }
  }

  const { error } = await probe.supabase
    .from("brand_files")
    .update({ is_featured: false })
    .eq("brand_id", brandId)
    .eq("user_id", userId)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
