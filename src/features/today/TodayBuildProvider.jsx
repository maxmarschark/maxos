import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useOrders } from "../orders/useOrders"
import { useCommissions } from "../commissions/useCommissions"
import { useContacts } from "../contacts/useContacts"
import { useAccounts } from "../accounts/useAccounts"
import { useTasks } from "../tasks/useTasks"
import { useCalendar } from "../calendar/useCalendar"
import { useGoogleCalendar } from "../google-calendar/useGoogleCalendar"
import { mergeCalendarEvents } from "../calendar/utils"
import { buildMyDay } from "./buildDay"
import { applyFallbackActions } from "./fallbackActions"
import { getTodayISO } from "./utils"
import { TodayBuildContext } from "./today-build-context"

const BUILD_DELAY_MS = 450

export function TodayBuildProvider({ children }) {
  const navigate = useNavigate()
  const { orders } = useOrders()
  const { commissions } = useCommissions()
  const { contacts } = useContacts()
  const { accounts } = useAccounts()
  const { tasks } = useTasks()
  const { events: maxOsEvents } = useCalendar()
  const { googleEvents } = useGoogleCalendar()

  const [plan, setPlan] = useState([])
  const [generatedAt, setGeneratedAt] = useState(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const buildDayPlan = useCallback(async () => {
    setIsBuilding(true)

    await new Promise((resolve) => {
      window.setTimeout(resolve, BUILD_DELAY_MS)
    })

    const calendarEvents = mergeCalendarEvents(maxOsEvents, googleEvents)
    const raw = buildMyDay({
      orders,
      contacts,
      accounts,
      commissions,
      tasks,
      calendarEvents,
      todayISO: getTodayISO(),
    })
    const withFallbacks = applyFallbackActions(raw)

    setPlan(withFallbacks)
    setGeneratedAt(new Date())
    setHasGenerated(true)
    setIsBuilding(false)

    if (window.location.pathname !== "/") {
      navigate("/")
    }
  }, [orders, contacts, accounts, commissions, tasks, maxOsEvents, googleEvents, navigate])

  const value = {
    plan,
    generatedAt,
    isBuilding,
    hasGenerated,
    buildDayPlan,
  }

  return <TodayBuildContext.Provider value={value}>{children}</TodayBuildContext.Provider>
}
