import { useCallback, useEffect, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import { DEALS_STORAGE_KEY, EMPTY_DEAL } from "./constants"
import { DealsContext } from "./deals-context"

function loadLocalDeals() {
  return loadFromStorage(DEALS_STORAGE_KEY, [])
}

function loadCloudApi() {
  return import("./dealsSupabase")
}

export function DealsProvider({ children }) {
  const [deals, setDeals] = useState(loadLocalDeals)

  const initCloud = useCallback(
    () => loadCloudApi().then(({ initCloudDeals }) => initCloudDeals()),
    []
  )
  const onCloudLoaded = useCallback((result) => {
    setDeals(result.deals)
  }, [])

  const { storageMode, storageModeRef, fallBackToLocal } = useCloudBootstrap({
    moduleName: "Deals",
    initCloud,
    onCloudLoaded,
  })

  useEffect(() => {
    saveToStorage(DEALS_STORAGE_KEY, deals)
  }, [deals])

  const syncDealToCloud = useCallback(
    async (deal) => {
      if (storageModeRef.current !== "cloud") return true
      const { updateCloudDeal } = await loadCloudApi()
      const result = await updateCloudDeal(deal)
      if (!result.ok) {
        console.error("[Max OS Deals] Cloud update failed:", result.error)
        fallBackToLocal()
        return false
      }
      return true
    },
    [fallBackToLocal]
  )

  const getDeal = useCallback((id) => deals.find((d) => d.id === id), [deals])

  const addDeal = useCallback(
    async (data) => {
      const now = new Date().toISOString()
      const deal = {
        ...EMPTY_DEAL,
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }

      if (storageModeRef.current === "cloud") {
        const { insertCloudDeal } = await loadCloudApi()
        const result = await insertCloudDeal(deal)
        if (result.ok) {
          setDeals((prev) => [result.deal, ...prev])
          return result.deal
        }
        console.error("[Max OS Deals] Cloud insert failed:", result.error)
        fallBackToLocal()
      }

      setDeals((prev) => [deal, ...prev])
      return deal
    },
    [fallBackToLocal]
  )

  const updateDeal = useCallback(
    (id, data) => {
      const now = new Date().toISOString()
      let updatedDeal = null

      setDeals((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d
          updatedDeal = { ...d, ...data, updatedAt: now }
          return updatedDeal
        })
      )

      if (updatedDeal) {
        void syncDealToCloud(updatedDeal)
      }
    },
    [syncDealToCloud]
  )

  const deleteDeal = useCallback(
    async (id) => {
      if (storageModeRef.current === "cloud") {
        const { deleteCloudDeal } = await loadCloudApi()
        const result = await deleteCloudDeal(id)
        if (!result.ok) {
          console.error("[Max OS Deals] Cloud delete failed:", result.error)
          fallBackToLocal()
        }
      }
      setDeals((prev) => prev.filter((d) => d.id !== id))
    },
    [fallBackToLocal]
  )

  const value = {
    deals,
    storageMode,
    getDeal,
    addDeal,
    updateDeal,
    deleteDeal,
  }

  return <DealsContext.Provider value={value}>{children}</DealsContext.Provider>
}
