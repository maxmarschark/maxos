import { ASSET_TYPES, LEGACY_CATEGORY_MAP } from "./constants"

export function sanitizeFileName(name) {
  const base = name.replace(/[/\\]/g, "_").replace(/\s+/g, "_")
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "")
  return cleaned || "file"
}

export function buildStoragePath(brandId, fileName) {
  return `${brandId}/${Date.now()}-${sanitizeFileName(fileName)}`
}

export function formatFileSize(bytes) {
  const size = Number(bytes) || 0
  if (size === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  let value = size
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const decimals = unit === 0 ? 0 : 1
  return `${value.toFixed(decimals)} ${units[unit]}`
}

export function getFileExtension(fileName) {
  return fileName?.split(".").pop()?.toLowerCase() ?? ""
}

export function isImageFile(fileType, fileName) {
  const mime = (fileType ?? "").toLowerCase()
  if (mime.startsWith("image/")) return true
  return ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(getFileExtension(fileName))
}

export function isPdfFile(fileType, fileName) {
  const mime = (fileType ?? "").toLowerCase()
  if (mime === "application/pdf") return true
  return getFileExtension(fileName) === "pdf"
}

export function isVideoFile(fileType, fileName) {
  const mime = (fileType ?? "").toLowerCase()
  if (mime.startsWith("video/")) return true
  return ["mp4", "mov", "webm", "avi"].includes(getFileExtension(fileName))
}

export function shouldOpenInBrowser(fileType, fileName) {
  return isImageFile(fileType, fileName) || isPdfFile(fileType, fileName)
}

export function normalizeAssetType(category) {
  return LEGACY_CATEGORY_MAP[category] ?? category ?? "Other"
}

export function parseTagsInput(value) {
  if (!value?.trim()) return []
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

export function formatTagsList(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return ""
  return tags.join(", ")
}

export function groupAssetsByType(files) {
  const buckets = Object.fromEntries(ASSET_TYPES.map((type) => [type, []]))

  for (const file of files) {
    if (file.isFeatured) continue
    const type = normalizeAssetType(file.category)
    if (buckets[type]) {
      buckets[type].push(file)
    } else {
      buckets.Other.push(file)
    }
  }

  return ASSET_TYPES.filter((type) => buckets[type].length > 0).map((type) => ({
    type,
    assets: buckets[type],
  }))
}
