import { useCallback, useEffect, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import {
  persistCloudDelete,
  persistCloudInsert,
  persistCloudUpdate,
} from "../../lib/supabase/cloudPersist"
import { useAuthReady } from "../auth/useAuthReady"
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
  const authReady = useAuthReady()
  const [brands, setBrands] = useState(loadLocalBrands)

  const initCloud = useCallback(
    () => loadCloudApi().then(({ initCloudBrands }) => initCloudBrands()),
    []
  )
  const onCloudLoaded = useCallback((result) => {
    setBrands(result.brands)
  }, [])

  const { storageMode, storageModeRef, fallBackToLocal } = useCloudBootstrap({
    moduleName: "Brands",
    initCloud,
    onCloudLoaded,
    authReady,
  })

  useEffect(() => {
    saveToStorage(BRANDS_STORAGE_KEY, brands)
  }, [brands])

  const mutateBrand = useCallback(
    async (brandId, updater) => {
      const existing = brands.find((b) => b.id === brandId)
      if (!existing) return false

      const updatedBrand = updater(existing)
      const { updateCloudBrand } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        fallBackToLocal,
        update: updateCloudBrand,
        entity: updatedBrand,
        label: "Brands",
      })

      if (!persisted.ok) return false
      setBrands((prev) =>
        prev.map((b) => (b.id === brandId ? persisted.entity : b))
      )
      return true
    },
    [brands, fallBackToLocal]
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

      const { insertCloudBrand } = await loadCloudApi()
      const persisted = await persistCloudInsert({
        storageModeRef,
        fallBackToLocal,
        insert: insertCloudBrand,
        entity: brand,
        label: "Brands",
      })

      if (!persisted.ok) return null
      setBrands((prev) => [persisted.entity, ...prev])
      return persisted.entity
    },
    [fallBackToLocal]
  )

  const updateBrand = useCallback(
    async (id, data) => {
      const existing = brands.find((b) => b.id === id)
      if (!existing) return false

      const updatedBrand = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      }

      const { updateCloudBrand } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        fallBackToLocal,
        update: updateCloudBrand,
        entity: updatedBrand,
        label: "Brands",
      })

      if (!persisted.ok) return false
      setBrands((prev) =>
        prev.map((b) => (b.id === id ? persisted.entity : b))
      )
      return true
    },
    [brands, fallBackToLocal]
  )

  const deleteBrand = useCallback(
    async (id) => {
      const { deleteCloudBrand } = await loadCloudApi()
      const persisted = await persistCloudDelete({
        storageModeRef,
        fallBackToLocal,
        remove: deleteCloudBrand,
        id,
        label: "Brands",
      })

      if (!persisted.ok) return false
      setBrands((prev) => prev.filter((b) => b.id !== id))
      return true
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
    async (brandId, data) => {
      const existing = brands.find((b) => b.id === brandId)
      if (!existing) return null

      const product = { ...EMPTY_PRODUCT, ...data, id: generateId() }
      const updatedBrand = {
        ...existing,
        products: [...existing.products, product],
        updatedAt: new Date().toISOString(),
      }

      const { updateCloudBrand } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        fallBackToLocal,
        update: updateCloudBrand,
        entity: updatedBrand,
        label: "Brands",
      })

      if (!persisted.ok) return null
      setBrands((prev) =>
        prev.map((b) => (b.id === brandId ? persisted.entity : b))
      )
      return product
    },
    [brands, fallBackToLocal]
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
