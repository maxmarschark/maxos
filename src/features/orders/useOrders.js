import { useContext } from "react"
import { OrdersContext } from "./orders-context"

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) {
    throw new Error("useOrders must be used within OrdersProvider")
  }
  return ctx
}
