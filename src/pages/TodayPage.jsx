import { Sun } from "lucide-react"
import { useContacts } from "../features/contacts/useContacts"
import { useTodayBuild } from "../features/today/useTodayBuild"
import { useTodayDashboard } from "../features/today/useTodayDashboard"
import { PageHeader } from "../components/ui/PageHeader"
import { TopMetricsRow } from "../features/today/components/TopMetricsRow"
import { BuildMyDayPanel } from "../features/today/components/BuildMyDayPanel"
import { CollectionsSection } from "../features/today/components/CollectionsSection"
import { FollowUpsSection } from "../features/today/components/FollowUpsSection"
import { OrdersAttentionSection } from "../features/today/components/OrdersAttentionSection"
import { CommissionSnapshot } from "../features/today/components/CommissionSnapshot"
import { ActivityFeed } from "../features/today/components/ActivityFeed"
import { getTodayISO } from "../features/today/utils"

export function TodayPage() {
  const dashboard = useTodayDashboard()
  const { plan, hasGenerated } = useTodayBuild()
  const { updateContact } = useContacts()

  function handleCompleteFollowUp(contactId) {
    updateContact(contactId, {
      lastContactDate: getTodayISO(),
      nextFollowUpDate: null,
    })
  }

  const subtitle = hasGenerated
    ? `${plan.length} prioritized action${plan.length !== 1 ? "s" : ""} in your plan`
    : dashboard.subtitle

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Sun}
        title={dashboard.greeting}
        description={subtitle}
      />

      <BuildMyDayPanel />

      <TopMetricsRow metrics={dashboard.topMetrics} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
