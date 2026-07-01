import { DollarSign, CheckCircle, FileText, AlertTriangle } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { cn } from "../../../lib/cn"

function SummaryCard({ icon: Icon, label, value, count, accent }) {
  const accents = {
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    indigo: "text-indigo-400",
    red: "text-red-400",
  }

  return (
    <Card padding="md" className="flex flex-col">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon size={14} strokeWidth={1.75} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className={cn("mt-2 text-2xl font-semibold tracking-tight", accents[accent])}>
        {value}
      </div>
      <p className="mt-1 text-xs text-zinc-600">
        {count} record{count !== 1 ? "s" : ""}
      </p>
    </Card>
  )
}

export function CommissionSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={DollarSign}
        label="Pending Commission"
        value={summary.pending.value}
        count={summary.pending.count}
        accent="amber"
      />
      <SummaryCard
        icon={CheckCircle}
        label="Paid Commission"
        value={summary.paid.value}
        count={summary.paid.count}
        accent="emerald"
      />
      <SummaryCard
        icon={FileText}
        label="Invoiced Commission"
        value={summary.invoiced.value}
        count={summary.invoiced.count}
        accent="indigo"
      />
      <SummaryCard
        icon={AlertTriangle}
        label="Disputed Commission"
        value={summary.disputed.value}
        count={summary.disputed.count}
        accent="red"
      />
    </div>
  )
}
