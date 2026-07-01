import { useCallback, useEffect, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { BRANDS_STORAGE_KEY, EMPTY_BRAND, EMPTY_PRODUCT } from "./constants"
import { SEED_BRANDS } from "./seed"
import { BrandsContext } from "./brands-context"

function loadBrands() {
  return loadFromStorage(BRANDS_STORAGE_KEY, SEED_BRANDS)
}

export function BrandsProvider({ children }) {
  const [brands, setBrands] = useState(loadBrands)

  useEffect(() => {
    saveToStorage(BRANDS_STORAGE_KEY, brands)
  }, [brands])

  const getBrand = useCallback(
    (id) => brands.find((b) => b.id === id),
    [brands]
  )

  const addBrand = useCallback((data) => {
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
    setBrands((prev) => [brand, ...prev])
    return brand
  }, [])

  const updateBrand = useCallback((id, data) => {
    setBrands((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, ...data, updatedAt: new Date().toISOString() }
          : b
      )
    )
  }, [])

  const deleteBrand = useCallback((id) => {
    setBrands((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const addNoteEntry = useCallback((brandId, content) => {
    const entry = {
      id: generateId(),
      content,
      createdAt: new Date().toISOString(),
    }
    setBrands((prev) =>
      prev.map((b) =>
        b.id === brandId
          ? {
              ...b,
              noteEntries: [entry, ...b.noteEntries],
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    )
  }, [])

  const deleteNoteEntry = useCallback((brandId, noteId) => {
    setBrands((prev) =>
      prev.map((b) =>
        b.id === brandId
          ? {
              ...b,
              noteEntries: b.noteEntries.filter((n) => n.id !== noteId),
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    )
  }, [])

  const addProduct = useCallback((brandId, data) => {
    const product = { ...EMPTY_PRODUCT, ...data, id: generateId() }
    setBrands((prev) =>
      prev.map((b) =>
        b.id === brandId
          ? {
              ...b,
              products: [...b.products, product],
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    )
    return product
  }, [])

  const updateProduct = useCallback((brandId, productId, data) => {
    setBrands((prev) =>
      prev.map((b) =>
        b.id === brandId
          ? {
              ...b,
              products: b.products.map((p) =>
                p.id === productId ? { ...p, ...data } : p
              ),
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    )
  }, [])

  const deleteProduct = useCallback((brandId, productId) => {
    setBrands((prev) =>
      prev.map((b) =>
        b.id === brandId
          ? {
              ...b,
              products: b.products.filter((p) => p.id !== productId),
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    )
  }, [])

  const value = {
    brands,
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
