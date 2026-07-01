import { todayData } from "../data/today"
import { RevenueMetrics } from "../components/today/RevenueMetrics"
import { TasksPanel } from "../components/today/TasksPanel"
import { AIPrioritiesPanel } from "../components/today/AIPrioritiesPanel"
import { RoutePanel } from "../components/today/RoutePanel"

export function TodayPage() {
  const { greeting, subtitle, metrics, tasks, aiPriorities, suggestedRoute } = todayData

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
