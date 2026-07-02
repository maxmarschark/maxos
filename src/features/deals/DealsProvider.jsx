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
import { DEALS_STORAGE_KEY, EMPTY_DEAL } from "./constants"
import { DealsContext } from "./deals-context"

function loadLocalDeals() {
  return loadFromStorage(DEALS_STORAGE_KEY, [])
}

function loadCloudApi() {
  return import("./dealsSupabase")
}

export function DealsProvider({ children }) {
  const authReady = useAuthReady()
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
    authReady,
  })

  useEffect(() => {
    saveToStorage(DEALS_STORAGE_KEY, deals)
  }, [deals])

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

      const { insertCloudDeal } = await loadCloudApi()
      const persisted = await persistCloudInsert({
        storageModeRef,
        fallBackToLocal,
        insert: insertCloudDeal,
        entity: deal,
        label: "Deals",
      })

      if (!persisted.ok) return null
      setDeals((prev) => [persisted.entity, ...prev])
      return persisted.entity
    },
    [fallBackToLocal]
  )

  const updateDeal = useCallback(
    async (id, data) => {
      const existing = deals.find((d) => d.id === id)
      if (!existing) return false

      const updatedDeal = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      }

      const { updateCloudDeal } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        fallBackToLocal,
        update: updateCloudDeal,
        entity: updatedDeal,
        label: "Deals",
      })

      if (!persisted.ok) return false
      setDeals((prev) =>
        prev.map((d) => (d.id === id ? persisted.entity : d))
      )
      return true
    },
    [deals, fallBackToLocal]
  )

  const deleteDeal = useCallback(
    async (id) => {
      const { deleteCloudDeal } = await loadCloudApi()
      const persisted = await persistCloudDelete({
        storageModeRef,
        fallBackToLocal,
        remove: deleteCloudDeal,
        id,
        label: "Deals",
      })

      if (!persisted.ok) return false
      setDeals((prev) => prev.filter((d) => d.id !== id))
      return true
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
