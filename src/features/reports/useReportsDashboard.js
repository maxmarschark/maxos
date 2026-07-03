import { useMemo } from "react"
import { useAccounts } from "../accounts/useAccounts"
import { useContacts } from "../contacts/useContacts"
import { useBrands } from "../brands/useBrands"
import { useDeals } from "../deals/useDeals"
import { useOrders } from "../orders/useOrders"
import { useCommissions } from "../commissions/useCommissions"
import { useTasks } from "../tasks/useTasks"
import { useCalendar } from "../calendar/useCalendar"
import { getTodayISO } from "../today/utils"
import { buildReportMetrics } from "./utils"

export function useReportsDashboard() {
  const { accounts } = useAccounts()
  const { contacts } = useContacts()
  const { brands } = useBrands()
  const { deals } = useDeals()
  const { orders } = useOrders()
  const { commissions } = useCommissions()
  const { tasks } = useTasks()
  const { events } = useCalendar()

  const todayISO = getTodayISO()

  return useMemo(
    () =>
      buildReportMetrics({
        accounts,
        contacts,
        brands,
        deals,
        orders,
        commissions,
        tasks,
        calendarEvents: events,
        todayISO,
      }),
    [accounts, contacts, brands, deals, orders, commissions, tasks, events, todayISO]
  )
}
