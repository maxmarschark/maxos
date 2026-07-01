import { useMemo } from "react"
import { useOrders } from "../orders/useOrders"
import { useCommissions } from "../commissions/useCommissions"
import { useContacts } from "../contacts/useContacts"
import { useAccounts } from "../accounts/useAccounts"
import {
  buildActivityFeed,
  buildCollectionsDue,
  buildCommissionSnapshot,
  buildContactFollowUps,
  buildOrdersAttention,
  buildTopMetrics,
  flattenFollowUps,
  flattenOrdersAttention,
  formatTodaySubtitle,
  getGreeting,
  getTodayISO,
} from "./utils"

export function useTodayDashboard() {
  const { orders } = useOrders()
  const { commissions } = useCommissions()
  const { contacts } = useContacts()
  const { accounts } = useAccounts()

  const todayISO = getTodayISO()

  return useMemo(() => {
    const collections = buildCollectionsDue(orders, todayISO)
    const followUps = buildContactFollowUps(contacts, todayISO)
    const followUpsFlat = flattenFollowUps(followUps)
    const ordersAttention = buildOrdersAttention(orders)
    const ordersAttentionFlat = flattenOrdersAttention(ordersAttention)
    const commissionSnapshot = buildCommissionSnapshot(commissions, todayISO)
    const activity = buildActivityFeed({ orders, contacts, accounts, commissions })
    const topMetrics = buildTopMetrics({
      collections,
      commissionSnapshot,
      orders,
      followUpsFlat,
    })

    return {
      todayISO,
      greeting: getGreeting(),
      subtitle: formatTodaySubtitle(0),
      collections,
      followUps,
      followUpsFlat,
      ordersAttention,
      ordersAttentionFlat,
      commissionSnapshot,
      topMetrics,
      activity,
    }
  }, [orders, commissions, contacts, accounts, todayISO])
}
