import { memo } from "react"
import { Wallet, DollarSign, Package, UserCheck } from "lucide-react"
import { MetricCard } from "../../../components/ui/MetricCard"

export const TopMetricsRow = memo(function TopMetricsRow({ metrics }) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <MetricCard
        icon={Wallet}
        label="Collections Due"
        value={metrics.collections.value}
        meta={`${metrics.collections.count} order${metrics.collections.count !== 1 ? "s" : ""}`}
        accent="red"
      />
      <MetricCard
        icon={DollarSign}
        label="Pending Commissions"
        value={metrics.pendingCommissions.value}
        meta={`${metrics.pendingCommissions.count} open`}
        accent="amber"
      />
      <MetricCard
        icon={Package}
        label="Open Orders"
        value={metrics.openOrders.value}
        meta={`${metrics.openOrders.inTransit} in transit`}
        accent="emerald"
      />
      <MetricCard
        icon={UserCheck}
        label="Follow-Ups Due"
        value={metrics.followUpsDue.count}
        meta={`${metrics.followUpsDue.overdue} overdue`}
        accent="indigo"
      />
    </div>
  )
})
