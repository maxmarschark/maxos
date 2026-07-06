import { useCallback, useEffect, useMemo, useState } from "react"
import { isSupabaseConfigured } from "../../lib/supabase/env"
import { useAuth } from "../auth/useAuth"
import { useBrands } from "../brands/useBrands"
import { MAX_FILE_SIZE_BYTES } from "./constants"
import {
  clearFeaturedBrandFile,
  deleteBrandFile,
  fetchBrandFiles,
  getBrandFileSignedUrl,
  setFeaturedBrandFile,
  uploadBrandFile,
  updateBrandFileMetadata,
} from "./brandFilesSupabase"
import { groupAssetsByType } from "./utils"

export function useBrandFiles(brandId) {
  const { storageMode } = useBrands()
  const { session, configured } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const cloudReady =
    configured && isSupabaseConfigured() && storageMode === "cloud" && Boolean(session)

  const featuredAsset = useMemo(() => files.find((f) => f.isFeatured) ?? null, [files])
  const groupedAssets = useMemo(() => groupAssetsByType(files), [files])

  const refresh = useCallback(async () => {
    if (!brandId || !cloudReady) {
      setFiles([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    const result = await fetchBrandFiles(brandId)
    if (!result.ok) {
      setError(result.error ?? "Failed to load assets")
      setFiles([])
    } else {
      setFiles(result.files)
    }
    setLoading(false)
  }, [brandId, cloudReady])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const uploadFile = useCallback(
    async (file, category, { notes = "", version = "", tags = [] } = {}) => {
      if (!cloudReady) {
        return { ok: false, error: "Sign in and connect to Supabase to upload assets" }
      }
      if (!file) {
        return { ok: false, error: "No file selected" }
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return { ok: false, error: "File exceeds 50 MB limit" }
      }

      const result = await uploadBrandFile({ brandId, file, category, notes, version, tags })
      if (result.ok) {
        setFiles((prev) => [result.file, ...prev])
      }
      return result
    },
    [brandId, cloudReady]
  )

  const removeFile = useCallback(async (file) => {
    const result = await deleteBrandFile(file)
    if (result.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== file.id))
    }
    return result
  }, [])

  const getSignedUrl = useCallback(async (filePath) => {
    return getBrandFileSignedUrl(filePath)
  }, [])

  const openFile = useCallback(async (file) => {
    const result = await getBrandFileSignedUrl(file.filePath)
    if (!result.ok) return result
    window.open(result.url, "_blank", "noopener,noreferrer")
    return { ok: true }
  }, [])

  const downloadFile = useCallback(async (file) => {
    const result = await getBrandFileSignedUrl(file.filePath)
    if (!result.ok) return result

    const link = document.createElement("a")
    link.href = result.url
    link.download = file.fileName
    link.rel = "noopener noreferrer"
    document.body.appendChild(link)
    link.click()
    link.remove()

    return { ok: true }
  }, [])

  const saveMetadata = useCallback(async (file, updates) => {
    const result = await updateBrandFileMetadata(file, updates)
    if (result.ok) {
      setFiles((prev) => prev.map((f) => (f.id === file.id ? result.file : f)))
    }
    return result
  }, [])

  const setFeatured = useCallback(
    async (file) => {
      const result = await setFeaturedBrandFile(brandId, file.id)
      if (result.ok) {
        setFiles((prev) =>
          prev.map((f) => ({
            ...f,
            isFeatured: f.id === file.id,
          }))
        )
      }
      return result
    },
    [brandId]
  )

  const clearFeatured = useCallback(async () => {
    const result = await clearFeaturedBrandFile(brandId)
    if (result.ok) {
      setFiles((prev) => prev.map((f) => ({ ...f, isFeatured: false })))
    }
    return result
  }, [brandId])

  return {
    files,
    featuredAsset,
    groupedAssets,
    loading,
    error,
    cloudReady,
    uploadFile,
    removeFile,
    openFile,
    downloadFile,
    getSignedUrl,
    saveMetadata,
    setFeatured,
    clearFeatured,
    refresh,
  }
}
