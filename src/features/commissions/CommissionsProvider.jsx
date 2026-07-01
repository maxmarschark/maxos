import { useCallback, useEffect, useMemo, useState } from "react"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import { useOrders } from "../orders/useOrders"
import { COMMISSIONS_STORAGE_KEY, EMPTY_COMMISSION_META } from "./constants"
import { CommissionsContext } from "./commissions-context"
import {
  buildCommissionRecords,
  computeAccountBreakdown,
  computeBrandBreakdown,
  computeCommissionSummary,
} from "./utils"

function loadStoredMeta() {
  return loadFromStorage(COMMISSIONS_STORAGE_KEY, [])
}

function loadCloudApi() {
  return import("./commissionsSupabase")
}

export function CommissionsProvider({ children }) {
  const { rawOrders, accounts, brands } = useOrders()
  const [storedMeta, setStoredMeta] = useState(loadStoredMeta)

  const initCloud = useCallback(
    () => loadCloudApi().then(({ initCloudCommissions }) => initCloudCommissions()),
    []
  )
  const onCloudLoaded = useCallback((result) => {
    setStoredMeta(result.commissions)
  }, [])

  const { storageMode, storageModeRef, fallBackToLocal } = useCloudBootstrap({
    moduleName: "Commissions",
    initCloud,
    onCloudLoaded,
  })

  const effectiveMeta = useMemo(() => {
    const orderIds = new Set(rawOrders.map((o) => o.id))
    return storedMeta.filter((m) => orderIds.has(m.orderId))
  }, [storedMeta, rawOrders])

  const commissions = useMemo(
    () => buildCommissionRecords(rawOrders, brands, accounts, effectiveMeta),
    [rawOrders, brands, accounts, effectiveMeta]
  )

  const summary = useMemo(() => computeCommissionSummary(commissions), [commissions])
  const brandBreakdown = useMemo(() => computeBrandBreakdown(commissions), [commissions])
  const accountBreakdown = useMemo(() => computeAccountBreakdown(commissions), [commissions])

  useEffect(() => {
    saveToStorage(COMMISSIONS_STORAGE_KEY, effectiveMeta)
  }, [effectiveMeta])

  const syncMetaToCloud = useCallback(
    async (meta) => {
      if (storageModeRef.current !== "cloud") return true
      const { upsertCloudCommission } = await loadCloudApi()
      const result = await upsertCloudCommission(meta)
      if (!result.ok) {
        console.error("[Max OS Commissions] Cloud upsert failed:", result.error)
        fallBackToLocal()
        return false
      }
      return true
    },
    [fallBackToLocal]
  )

  const upsertMeta = useCallback(
    (orderId, updates) => {
      let updatedMeta = null

      setStoredMeta((prev) => {
        const existing = prev.find((m) => m.orderId === orderId)
        if (existing) {
          updatedMeta = { ...existing, ...updates, orderId }
          return prev.map((m) => (m.orderId === orderId ? updatedMeta : m))
        }
        updatedMeta = { orderId, ...EMPTY_COMMISSION_META, ...updates }
        return [...prev, updatedMeta]
      })

      if (updatedMeta) {
        void syncMetaToCloud(updatedMeta)
      }
    },
    [syncMetaToCloud]
  )

  const updateCommission = useCallback(
    (orderId, updates) => {
      upsertMeta(orderId, updates)
    },
    [upsertMeta]
  )

  const markStatus = useCallback(
    (orderId, status) => {
      const today = new Date().toISOString().slice(0, 10)
      const updates = { status }
      if (status === "Paid") {
        updates.paidDate = today
      }
      upsertMeta(orderId, updates)
    },
    [upsertMeta]
  )

  const getCommission = useCallback(
    (orderId) => commissions.find((c) => c.orderId === orderId),
    [commissions]
  )

  const value = {
    commissions,
    summary,
    brandBreakdown,
    accountBreakdown,
    storageMode,
    getCommission,
    updateCommission,
    markStatus,
  }

  return (
    <CommissionsContext.Provider value={value}>{children}</CommissionsContext.Provider>
  )
}
