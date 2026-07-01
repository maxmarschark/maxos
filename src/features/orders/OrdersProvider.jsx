import { useCallback, useEffect, useMemo, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
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
  })

  useEffect(() => {
    saveToStorage(ORDERS_STORAGE_KEY, orders)
  }, [orders])

  const syncOrderToCloud = useCallback(
    async (order) => {
      if (storageModeRef.current !== "cloud") return true
      const { updateCloudOrder } = await loadCloudApi()
      const result = await updateCloudOrder(order)
      if (!result.ok) {
        console.error("[Max OS Orders] Cloud update failed:", result.error)
        fallBackToLocal()
        return false
      }
      return true
    },
    [fallBackToLocal]
  )

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

      if (storageModeRef.current === "cloud") {
        const { insertCloudOrder } = await loadCloudApi()
        const result = await insertCloudOrder(order)
        if (result.ok) {
          setOrders((prev) => [result.order, ...prev])
          return result.order
        }
        console.error("[Max OS Orders] Cloud insert failed:", result.error)
        fallBackToLocal()
      }

      setOrders((prev) => [order, ...prev])
      return order
    },
    [fallBackToLocal]
  )

  const updateOrder = useCallback(
    (id, data) => {
      const now = new Date().toISOString()
      let updatedOrder = null

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o
          const merged = { ...o, ...data, updatedAt: now }
          merged.commissionAmount = calcCommissionAmount(
            merged.orderAmount,
            merged.commissionPercent
          )
          updatedOrder = merged
          return merged
        })
      )

      if (updatedOrder) {
        void syncOrderToCloud(updatedOrder)
      }
    },
    [syncOrderToCloud]
  )

  const deleteOrder = useCallback(
    async (id) => {
      if (storageModeRef.current === "cloud") {
        const { deleteCloudOrder } = await loadCloudApi()
        const result = await deleteCloudOrder(id)
        if (!result.ok) {
          console.error("[Max OS Orders] Cloud delete failed:", result.error)
          fallBackToLocal()
        }
      }
      setOrders((prev) => prev.filter((o) => o.id !== id))
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
