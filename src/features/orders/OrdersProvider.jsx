import { useCallback, useEffect, useMemo, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { ORDERS_STORAGE_KEY, EMPTY_ORDER } from "./constants"
import { buildSeedOrders } from "./seed"
import { OrdersContext } from "./orders-context"
import {
  calcCommissionAmount,
  enrichOrders,
  loadAccountsForOrders,
  loadBrandsForOrders,
} from "./utils"

function loadOrders() {
  return loadFromStorage(ORDERS_STORAGE_KEY, buildSeedOrders())
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders)
  const [accounts, setAccounts] = useState(loadAccountsForOrders)
  const [brands, setBrands] = useState(loadBrandsForOrders)

  useEffect(() => {
    saveToStorage(ORDERS_STORAGE_KEY, orders)
  }, [orders])

  useEffect(() => {
    function syncReferences() {
      setAccounts(loadAccountsForOrders())
      setBrands(loadBrandsForOrders())
    }

    window.addEventListener("storage", syncReferences)
    return () => window.removeEventListener("storage", syncReferences)
  }, [])

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

  const addOrder = useCallback((data) => {
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
    setOrders((prev) => [order, ...prev])
    return order
  }, [])

  const updateOrder = useCallback((id, data) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const merged = { ...o, ...data, updatedAt: new Date().toISOString() }
        merged.commissionAmount = calcCommissionAmount(
          merged.orderAmount,
          merged.commissionPercent
        )
        return merged
      })
    )
  }, [])

  const deleteOrder = useCallback((id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }, [])

  const refreshReferences = useCallback(() => {
    setAccounts(loadAccountsForOrders())
    setBrands(loadBrandsForOrders())
  }, [])

  const value = {
    orders: enrichedOrders,
    rawOrders: orders,
    accounts,
    brands,
    getOrder,
    getOrdersByAccount,
    getOrdersByBrand,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshReferences,
  }

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
