import { useCallback, useEffect, useRef, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { isSupabaseConfigured } from "../../lib/supabase/env"
import { BRANDS_STORAGE_KEY, EMPTY_BRAND, EMPTY_PRODUCT } from "./constants"
import { SEED_BRANDS } from "./seed"
import { BrandsContext } from "./brands-context"

function loadLocalBrands() {
  return loadFromStorage(BRANDS_STORAGE_KEY, SEED_BRANDS)
}

function loadCloudApi() {
  return import("./brandsSupabase")
}

export function BrandsProvider({ children }) {
  const [brands, setBrands] = useState(loadLocalBrands)
  const [storageMode, setStorageMode] = useState("local")
  const storageModeRef = useRef("local")

  const setMode = useCallback((mode) => {
    storageModeRef.current = mode
    setStorageMode(mode)
  }, [])

  const fallBackToLocal = useCallback(() => {
    console.warn("[Max OS Brands] LOCAL — falling back to localStorage")
    setMode("local")
  }, [setMode])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!isSupabaseConfigured()) {
        console.info("[Max OS Brands] LOCAL — Supabase env vars not configured")
        return
      }

      const { initCloudBrands } = await loadCloudApi()
      const result = await initCloudBrands()
      if (cancelled) return

      if (result.ok) {
        setBrands(result.brands)
        setMode("cloud")
        return
      }

      console.info(
        "[Max OS Brands] LOCAL — using localStorage fallback",
        result.reason ? `(${result.reason})` : ""
      )
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [setMode])

  useEffect(() => {
    saveToStorage(BRANDS_STORAGE_KEY, brands)
  }, [brands])

  const syncBrandToCloud = useCallback(
    async (brand) => {
      if (storageModeRef.current !== "cloud") return true
      const { updateCloudBrand } = await loadCloudApi()
      const result = await updateCloudBrand(brand)
      if (!result.ok) {
        console.error("[Max OS Brands] Cloud update failed:", result.error)
        fallBackToLocal()
        return false
      }
      return true
    },
    [fallBackToLocal]
  )

  const mutateBrand = useCallback(
    (brandId, updater) => {
      let updatedBrand = null

      setBrands((prev) =>
        prev.map((b) => {
          if (b.id !== brandId) return b
          updatedBrand = updater(b)
          return updatedBrand
        })
      )

      if (updatedBrand) {
        void syncBrandToCloud(updatedBrand)
      }
    },
    [syncBrandToCloud]
  )

  const getBrand = useCallback(
    (id) => brands.find((b) => b.id === id),
    [brands]
  )

  const addBrand = useCallback(
    async (data) => {
      const now = new Date().toISOString()
      const brand = {
        ...EMPTY_BRAND,
        ...data,
        id: generateId(),
        products: [],
        noteEntries: [],
        createdAt: now,
        updatedAt: now,
      }

      if (storageModeRef.current === "cloud") {
        const { insertCloudBrand } = await loadCloudApi()
        const result = await insertCloudBrand(brand)
        if (result.ok) {
          setBrands((prev) => [result.brand, ...prev])
          return result.brand
        }
        console.error("[Max OS Brands] Cloud insert failed:", result.error)
        fallBackToLocal()
      }

      setBrands((prev) => [brand, ...prev])
      return brand
    },
    [fallBackToLocal]
  )

  const updateBrand = useCallback(
    (id, data) => {
      const now = new Date().toISOString()
      let updatedBrand = null

      setBrands((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b
          updatedBrand = { ...b, ...data, updatedAt: now }
          return updatedBrand
        })
      )

      if (updatedBrand) {
        void syncBrandToCloud(updatedBrand)
      }
    },
    [syncBrandToCloud]
  )

  const deleteBrand = useCallback(
    async (id) => {
      if (storageModeRef.current === "cloud") {
        const { deleteCloudBrand } = await loadCloudApi()
        const result = await deleteCloudBrand(id)
        if (!result.ok) {
          console.error("[Max OS Brands] Cloud delete failed:", result.error)
          fallBackToLocal()
        }
      }
      setBrands((prev) => prev.filter((b) => b.id !== id))
    },
    [fallBackToLocal]
  )

  const addNoteEntry = useCallback(
    (brandId, content) => {
      const entry = {
        id: generateId(),
        content,
        createdAt: new Date().toISOString(),
      }
      mutateBrand(brandId, (b) => ({
        ...b,
        noteEntries: [entry, ...b.noteEntries],
        updatedAt: new Date().toISOString(),
      }))
    },
    [mutateBrand]
  )

  const deleteNoteEntry = useCallback(
    (brandId, noteId) => {
      mutateBrand(brandId, (b) => ({
        ...b,
        noteEntries: b.noteEntries.filter((n) => n.id !== noteId),
        updatedAt: new Date().toISOString(),
      }))
    },
    [mutateBrand]
  )

  const addProduct = useCallback(
    (brandId, data) => {
      const product = { ...EMPTY_PRODUCT, ...data, id: generateId() }
      let updatedBrand = null

      setBrands((prev) =>
        prev.map((b) => {
          if (b.id !== brandId) return b
          updatedBrand = {
            ...b,
            products: [...b.products, product],
            updatedAt: new Date().toISOString(),
          }
          return updatedBrand
        })
      )

      if (updatedBrand) {
        void syncBrandToCloud(updatedBrand)
      }
      return product
    },
    [syncBrandToCloud]
  )

  const updateProduct = useCallback(
    (brandId, productId, data) => {
      mutateBrand(brandId, (b) => ({
        ...b,
        products: b.products.map((p) => (p.id === productId ? { ...p, ...data } : p)),
        updatedAt: new Date().toISOString(),
      }))
    },
    [mutateBrand]
  )

  const deleteProduct = useCallback(
    (brandId, productId) => {
      mutateBrand(brandId, (b) => ({
        ...b,
        products: b.products.filter((p) => p.id !== productId),
        updatedAt: new Date().toISOString(),
      }))
    },
    [mutateBrand]
  )

  const value = {
    brands,
    storageMode,
    getBrand,
    addBrand,
    updateBrand,
    deleteBrand,
    addNoteEntry,
    deleteNoteEntry,
    addProduct,
    updateProduct,
    deleteProduct,
  }

  return (
    <BrandsContext.Provider value={value}>{children}</BrandsContext.Provider>
  )
}
