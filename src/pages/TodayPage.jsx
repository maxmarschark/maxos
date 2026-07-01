import { useMemo } from "react"
import { todayData } from "../data/today"
import { RevenueMetrics } from "../components/today/RevenueMetrics"
import { TasksPanel } from "../components/today/TasksPanel"
import { AIPrioritiesPanel } from "../components/today/AIPrioritiesPanel"
import { RoutePanel } from "../components/today/RoutePanel"
import { useOrders } from "../features/orders/useOrders"
import { computeDashboardMetrics } from "../features/orders/utils"

export function TodayPage() {
  const { rawOrders } = useOrders()
  const { greeting, subtitle, tasks, aiPriorities, suggestedRoute } = todayData

  const metrics = useMemo(() => {
    const orderMetrics = computeDashboardMetrics(rawOrders)
    return {
      revenueToday: todayData.metrics.revenueToday,
      collectionsDue: orderMetrics.collectionsDue,
      openOrders: orderMetrics.openOrders,
      pendingCommissions: orderMetrics.pendingCommissions,
    }
  }, [rawOrders])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>

      <RevenueMetrics metrics={metrics} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TasksPanel tasks={tasks} />
        <AIPrioritiesPanel priorities={aiPriorities} />
      </div>

      <RoutePanel route={suggestedRoute} />
    </div>
  )
}
