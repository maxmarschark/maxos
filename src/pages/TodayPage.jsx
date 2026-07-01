import { Sun } from "lucide-react"
import { useContacts } from "../features/contacts/useContacts"
import { useTasks } from "../features/tasks/useTasks"
import { useTodayBuild } from "../features/today/useTodayBuild"
import { useTodayDashboard } from "../features/today/useTodayDashboard"
import { PageHeader } from "../components/ui/PageHeader"
import { TopMetricsRow } from "../features/today/components/TopMetricsRow"
import { BuildMyDayPanel } from "../features/today/components/BuildMyDayPanel"
import { TasksDueSection } from "../features/today/components/TasksDueSection"
import { CollectionsSection } from "../features/today/components/CollectionsSection"
import { FollowUpsSection } from "../features/today/components/FollowUpsSection"
import { OrdersAttentionSection } from "../features/today/components/OrdersAttentionSection"
import { CommissionSnapshot } from "../features/today/components/CommissionSnapshot"
import { ActivityFeed } from "../features/today/components/ActivityFeed"
import { getTodayISO } from "../features/today/utils"
import { useToast } from "../components/ui/useToast"

export function TodayPage() {
  const dashboard = useTodayDashboard()
  const { plan, hasGenerated } = useTodayBuild()
  const { updateContact } = useContacts()
  const { markComplete } = useTasks()
  const { toast } = useToast()

  function handleCompleteFollowUp(contactId) {
    updateContact(contactId, {
      lastContactDate: getTodayISO(),
      nextFollowUpDate: null,
    })
  }

  function handleCompleteTask(taskId) {
    markComplete(taskId)
    toast("Task marked complete")
  }

  const subtitle = hasGenerated
    ? `${plan.length} prioritized action${plan.length !== 1 ? "s" : ""} in your plan`
    : dashboard.subtitle

  return (
    <div className="space-y-5">
      <PageHeader icon={Sun} title={dashboard.greeting} description={subtitle} />

      <BuildMyDayPanel />

      <TopMetricsRow metrics={dashboard.topMetrics} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <TasksDueSection
          tasksFlat={dashboard.tasksDueFlat}
          onCompleteTask={handleCompleteTask}
        />
        <CollectionsSection collections={dashboard.collections} />
        <FollowUpsSection
          followUpsFlat={dashboard.followUpsFlat}
          onCompleteFollowUp={handleCompleteFollowUp}
        />
        <OrdersAttentionSection ordersFlat={dashboard.ordersAttentionFlat} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <CommissionSnapshot snapshot={dashboard.commissionSnapshot} />
        <ActivityFeed activity={dashboard.activity} />
      </div>
    </div>
  )
}
