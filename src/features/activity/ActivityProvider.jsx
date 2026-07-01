import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { isSupabaseConfigured } from "../../lib/supabase/env"
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
  const [storageMode, setStorageMode] = useState("local")
  const storageModeRef = useRef("local")

  const setMode = useCallback((mode) => {
    storageModeRef.current = mode
    setStorageMode(mode)
  }, [])

  const fallBackToLocal = useCallback(() => {
    console.warn("[Max OS Activity] LOCAL — falling back to local timeline")
    setMode("local")
  }, [setMode])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!isSupabaseConfigured()) {
        console.info("[Max OS Activity] LOCAL — Supabase env vars not configured")
        return
      }

      const { initCloudActivity } = await loadCloudApi()
      const result = await initCloudActivity()
      if (cancelled) return

      if (result.ok) {
        setCloudEvents(result.events)
        setMode("cloud")
        return
      }

      console.info(
        "[Max OS Activity] LOCAL — using relationship timeline fallback",
        result.reason ? `(${result.reason})` : ""
      )
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [setMode])

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
