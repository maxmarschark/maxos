import { TrendingUp, AlertCircle, Package, DollarSign } from "lucide-react"
import { Card } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { cn } from "../../lib/cn"

function MetricCard({ icon: Icon, label, value, meta, accent, children }) {
  const accents = {
    indigo: "text-indigo-400",
    red: "text-red-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
  }

  return (
    <Card padding="md" className="flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-zinc-500">
          <Icon size={14} strokeWidth={1.75} />
          <span className="text-xs font-medium">{label}</span>
        </div>
        {meta && (
          <Badge variant={meta.variant ?? "default"} className="normal-case tracking-normal">
            {meta.text}
          </Badge>
        )}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold tracking-tight", accents[accent])}>
        {value}
      </div>
      {children}
    </Card>
  )
}

export function RevenueMetrics({ metrics }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={TrendingUp}
        label="Revenue Today"
        value={metrics.revenueToday.value}
        accent="indigo"
        meta={{ text: metrics.revenueToday.change, variant: "success" }}
      />
      <MetricCard
        icon={AlertCircle}
        label="Collections Due"
        value={metrics.collectionsDue.value}
        accent="red"
        meta={{
          text: `${metrics.collectionsDue.overdue} overdue`,
          variant: "danger",
        }}
      >
        <p className="mt-1 text-xs text-zinc-600">
          {metrics.collectionsDue.count} order{metrics.collectionsDue.count !== 1 ? "s" : ""}{" "}
          awaiting payment
        </p>
      </MetricCard>
      <MetricCard
        icon={Package}
        label="Open Orders"
        value={metrics.openOrders.value}
        accent="emerald"
        meta={{ text: `${metrics.openOrders.pending} pending`, variant: "warning" }}
      >
        <p className="mt-1 text-xs text-zinc-600">
          {metrics.openOrders.inTransit} in transit
        </p>
      </MetricCard>
      <MetricCard
        icon={DollarSign}
        label="Pending Commissions"
        value={metrics.pendingCommissions.value}
        accent="amber"
        meta={{
          text: `${metrics.pendingCommissions.count} unpaid`,
          variant: "warning",
        }}
      />
    </div>
  )
}
