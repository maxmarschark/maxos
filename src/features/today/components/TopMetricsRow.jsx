import { Wallet, DollarSign, Package, UserCheck } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { cn } from "../../../lib/cn"

function Metric({ icon: Icon, label, value, meta, accent }) {
  const accents = {
    red: "text-red-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    indigo: "text-indigo-400",
  }

  return (
    <Card padding="sm" className="flex flex-col">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Icon size={13} strokeWidth={1.75} />
        <span className="text-[11px] font-medium leading-tight">{label}</span>
      </div>
      <div className={cn("mt-1.5 text-xl font-semibold tracking-tight", accents[accent])}>
        {value}
      </div>
      {meta && <p className="mt-0.5 text-[11px] text-zinc-600">{meta}</p>}
    </Card>
  )
}

export function TopMetricsRow({ metrics }) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <Metric
        icon={Wallet}
        label="Collections Due"
        value={metrics.collections.value}
        meta={`${metrics.collections.count} order${metrics.collections.count !== 1 ? "s" : ""}`}
        accent="red"
      />
      <Metric
        icon={DollarSign}
        label="Pending Commissions"
        value={metrics.pendingCommissions.value}
        meta={`${metrics.pendingCommissions.count} open`}
        accent="amber"
      />
      <Metric
        icon={Package}
        label="Open Orders"
        value={metrics.openOrders.value}
        meta={`${metrics.openOrders.inTransit} in transit`}
        accent="emerald"
      />
      <Metric
        icon={UserCheck}
        label="Follow-Ups Due"
        value={metrics.followUpsDue.count}
        meta={`${metrics.followUpsDue.overdue} overdue`}
        accent="indigo"
      />
    </div>
  )
}
