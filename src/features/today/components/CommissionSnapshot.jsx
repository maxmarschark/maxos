import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { SectionHeader } from "./SectionHeader"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { dashboardCardClass } from "./dashboardLayout"

function Stat({ label, value, accent }) {
  const accents = {
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    indigo: "text-indigo-400",
  }

  return (
    <div className="text-center">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className={cn("mt-0.5 text-base font-semibold tabular-nums", accents[accent])}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}

export function CommissionSnapshot({ snapshot }) {
  const hasData =
    snapshot.pending.count > 0 ||
    snapshot.paidThisMonth.count > 0 ||
    snapshot.outstanding.count > 0

  return (
    <Card padding="md" className={dashboardCardClass}>
      <SectionHeader title="Commission Snapshot" />
      {!hasData ? (
        <SectionEmpty centered>No commission activity yet.</SectionEmpty>
      ) : (
        <div className="flex flex-1 items-center">
          <div className="grid w-full grid-cols-3 divide-x divide-zinc-800/80">
            <Stat label="Pending" value={snapshot.pending.total} accent="amber" />
            <Stat label="Paid (month)" value={snapshot.paidThisMonth.total} accent="emerald" />
            <Stat label="Outstanding" value={snapshot.outstanding.total} accent="indigo" />
          </div>
        </div>
      )}
    </Card>
  )
}
