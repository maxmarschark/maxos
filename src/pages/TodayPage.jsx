import { useContacts } from "../features/contacts/useContacts"
import { useTodayBuild } from "../features/today/useTodayBuild"
import { useTodayDashboard } from "../features/today/useTodayDashboard"
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
          {dashboard.greeting}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {hasGenerated
            ? `${plan.length} prioritized action${plan.length !== 1 ? "s" : ""} in your plan`
            : dashboard.subtitle}
        </p>
      </div>

      <TopMetricsRow metrics={dashboard.topMetrics} />

      <BuildMyDayPanel />

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
