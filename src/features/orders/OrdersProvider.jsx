import { useCallback, useEffect, useMemo, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import {
  persistCloudDelete,
  persistCloudInsert,
  persistCloudUpdate,
} from "../../lib/supabase/cloudPersist"
import { useAuthReady } from "../auth/useAuthReady"
import { useAccounts } from "../accounts/useAccounts"
import { useBrands } from "../brands/useBrands"
import { ORDERS_STORAGE_KEY, EMPTY_ORDER } from "./constants"
import { buildSeedOrders } from "./seed"
import { OrdersContext } from "./orders-context"
import { calcCommissionAmount, enrichOrders } from "./utils"

function loadLocalOrders() {
  return loadFromStorage(ORDERS_STORAGE_KEY, buildSeedOrders())
}

function loadCloudApi() {
  return import("./ordersSupabase")
}

export function OrdersProvider({ children }) {
  const authReady = useAuthReady()
  const { accounts } = useAccounts()
  const { brands } = useBrands()

  const [orders, setOrders] = useState(loadLocalOrders)

  const initCloud = useCallback(
    () => loadCloudApi().then(({ initCloudOrders }) => initCloudOrders()),
    []
  )
  const onCloudLoaded = useCallback((result) => {
    setOrders(result.orders)
  }, [])

  const { storageMode, storageModeRef, fallBackToLocal } = useCloudBootstrap({
    moduleName: "Orders",
    initCloud,
    onCloudLoaded,
    authReady,
  })

  useEffect(() => {
    saveToStorage(ORDERS_STORAGE_KEY, orders)
  }, [orders])

  const enrichedOrders = useMemo(
    () => enrichOrders(orders, accounts, brands),
    [orders, accounts, brands]
  )

  const getOrder = useCallback(
    (id) => enrichedOrders.find((o) => o.id === id),
    [enrichedOrders]
  )

  const getOrdersByAccount = useCallback(
    (accountId) => enrichedOrders.filter((o) => o.accountId === accountId),
    [enrichedOrders]
  )

  const getOrdersByBrand = useCallback(
    (brandId) => enrichedOrders.filter((o) => o.brandId === brandId),
    [enrichedOrders]
  )

  const addOrder = useCallback(
    async (data) => {
      const now = new Date().toISOString()
      const commissionAmount = calcCommissionAmount(data.orderAmount, data.commissionPercent)
      const order = {
        ...EMPTY_ORDER,
        ...data,
        commissionAmount,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }

      const { insertCloudOrder } = await loadCloudApi()
      const persisted = await persistCloudInsert({
        storageModeRef,
        fallBackToLocal,
        insert: insertCloudOrder,
        entity: order,
        label: "Orders",
      })

      if (!persisted.ok) return null
      setOrders((prev) => [persisted.entity, ...prev])
      return persisted.entity
    },
    [fallBackToLocal]
  )

  const updateOrder = useCallback(
    async (id, data) => {
      const existing = orders.find((o) => o.id === id)
      if (!existing) return false

      const merged = { ...existing, ...data, updatedAt: new Date().toISOString() }
      merged.commissionAmount = calcCommissionAmount(
        merged.orderAmount,
        merged.commissionPercent
      )

      const { updateCloudOrder } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        fallBackToLocal,
        update: updateCloudOrder,
        entity: merged,
        label: "Orders",
      })

      if (!persisted.ok) return false
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? persisted.entity : o))
      )
      return true
    },
    [orders, fallBackToLocal]
  )

  const deleteOrder = useCallback(
    async (id) => {
      const { deleteCloudOrder } = await loadCloudApi()
      const persisted = await persistCloudDelete({
        storageModeRef,
        fallBackToLocal,
        remove: deleteCloudOrder,
        id,
        label: "Orders",
      })

      if (!persisted.ok) return false
      setOrders((prev) => prev.filter((o) => o.id !== id))
      return true
    },
    [fallBackToLocal]
  )

  const value = {
    orders: enrichedOrders,
    rawOrders: orders,
    accounts,
    brands,
    storageMode,
    getOrder,
    getOrdersByAccount,
    getOrdersByBrand,
    addOrder,
    updateOrder,
    deleteOrder,
  }

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
