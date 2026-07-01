import { useMemo } from "react"
import { useOrders } from "../orders/useOrders"
import { useCommissions } from "../commissions/useCommissions"
import { useContacts } from "../contacts/useContacts"
import { useAccounts } from "../accounts/useAccounts"
import { useTasks } from "../tasks/useTasks"
import { flattenTasksForToday } from "../tasks/utils"
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
  const { tasks } = useTasks()

  const todayISO = getTodayISO()

  return useMemo(() => {
    const collections = buildCollectionsDue(orders, todayISO)
    const followUps = buildContactFollowUps(contacts, todayISO)
    const followUpsFlat = flattenFollowUps(followUps)
    const tasksDueFlat = flattenTasksForToday(tasks, todayISO)
    const ordersAttention = buildOrdersAttention(orders)
    const ordersAttentionFlat = flattenOrdersAttention(ordersAttention)
    const commissionSnapshot = buildCommissionSnapshot(commissions, todayISO)
    const activity = buildActivityFeed({ orders, contacts, accounts, commissions })
    const topMetrics = buildTopMetrics({
      collections,
      commissionSnapshot,
      orders,
      followUpsFlat,
      tasksDueFlat,
    })

    return {
      todayISO,
      greeting: getGreeting(),
      subtitle: formatTodaySubtitle(tasksDueFlat.length),
      collections,
      followUps,
      followUpsFlat,
      tasksDueFlat,
      ordersAttention,
      ordersAttentionFlat,
      commissionSnapshot,
      topMetrics,
      activity,
    }
  }, [orders, commissions, contacts, accounts, tasks, todayISO])
}
