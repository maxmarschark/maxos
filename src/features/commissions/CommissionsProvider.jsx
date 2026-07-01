import { useCallback, useEffect, useMemo, useState } from "react"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
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

export function CommissionsProvider({ children }) {
  const { rawOrders, accounts, brands, refreshReferences } = useOrders()
  const [storedMeta, setStoredMeta] = useState(loadStoredMeta)

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

  const upsertMeta = useCallback((orderId, updates) => {
    setStoredMeta((prev) => {
      const existing = prev.find((m) => m.orderId === orderId)
      if (existing) {
        return prev.map((m) =>
          m.orderId === orderId ? { ...m, ...updates, orderId } : m
        )
      }
      return [...prev, { orderId, ...EMPTY_COMMISSION_META, ...updates }]
    })
  }, [])

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
    getCommission,
    updateCommission,
    markStatus,
    refreshReferences,
  }

  return (
    <CommissionsContext.Provider value={value}>{children}</CommissionsContext.Provider>
  )
}
