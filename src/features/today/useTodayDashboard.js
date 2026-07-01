import { useMemo } from "react"
import { useOrders } from "../orders/useOrders"
import { useCommissions } from "../commissions/useCommissions"
import { useContacts } from "../contacts/useContacts"
import { useTasks } from "../tasks/useTasks"
import { useActivity } from "../activity/useActivity"
import { useCalendar } from "../calendar/useCalendar"
import { useGoogleCalendar } from "../google-calendar/useGoogleCalendar"
import { mergeCalendarEvents, filterEventsOnDate } from "../calendar/utils"
import { flattenTasksForToday } from "../tasks/utils"
import {
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
  const { tasks } = useTasks()
  const { activity } = useActivity()
  const { events: maxOsEvents } = useCalendar()
  const { googleEvents } = useGoogleCalendar()

  const todayISO = getTodayISO()

  return useMemo(() => {
    const calendarEventsToday = filterEventsOnDate(
      mergeCalendarEvents(maxOsEvents, googleEvents),
      todayISO
    )
    const collections = buildCollectionsDue(orders, todayISO)
    const followUps = buildContactFollowUps(contacts, todayISO)
    const followUpsFlat = flattenFollowUps(followUps)
    const tasksDueFlat = flattenTasksForToday(tasks, todayISO)
    const ordersAttention = buildOrdersAttention(orders)
    const ordersAttentionFlat = flattenOrdersAttention(ordersAttention)
    const commissionSnapshot = buildCommissionSnapshot(commissions, todayISO)
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
      calendarEventsToday,
    }
  }, [orders, commissions, contacts, tasks, activity, maxOsEvents, googleEvents, todayISO])
}
