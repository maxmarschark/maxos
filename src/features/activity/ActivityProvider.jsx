import { useCallback, useMemo, useState } from "react"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import { buildActivityTimeline, buildRelationshipContext } from "../../lib/relationships"
import { useAccounts } from "../accounts/useAccounts"
import { useBrands } from "../brands/useBrands"
import { useContacts } from "../contacts/useContacts"
import { useOrders } from "../orders/useOrders"
import { useCommissions } from "../commissions/useCommissions"
import { useTasks } from "../tasks/useTasks"
import { ActivityContext } from "./activity-context"

function loadCloudApi() {
  return import("./activitySupabase")
}

export function ActivityProvider({ children }) {
  const { accounts } = useAccounts()
  const { brands } = useBrands()
  const { contacts } = useContacts()
  const { orders } = useOrders()
  const { commissions } = useCommissions()
  const { tasks } = useTasks()

  const [cloudEvents, setCloudEvents] = useState([])

  const initCloud = useCallback(
    () => loadCloudApi().then(({ initCloudActivity }) => initCloudActivity()),
    []
  )
  const onCloudLoaded = useCallback((result) => {
    setCloudEvents(result.events)
  }, [])

  const { storageMode, fallBackToLocal } = useCloudBootstrap({
    moduleName: "Activity",
    initCloud,
    onCloudLoaded,
  })

  const localActivity = useMemo(() => {
    const ctx = buildRelationshipContext({
      accounts,
      contacts,
      orders,
      commissions,
      tasks,
      brands,
    })
    return buildActivityTimeline(ctx, null, 20)
  }, [accounts, contacts, orders, commissions, tasks, brands])

  const activity = useMemo(() => {
    if (storageMode === "cloud") {
      return [...cloudEvents]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20)
    }
    return localActivity
  }, [storageMode, cloudEvents, localActivity])

  const value = {
    activity,
    storageMode,
    fallBackToLocal,
  }

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}
