import {
  Phone,
  MapPin,
  DollarSign,
  Package,
  Wallet,
} from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { cn } from "../../../lib/cn"

const icons = { Phone, MapPin, DollarSign, Package, Wallet }

function KpiCard({ icon, label, value, accent }) {
  const Icon = icons[icon]
  const accents = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    zinc: "text-zinc-300",
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
    </Card>
  )
}

export function KpiCards({ kpis }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <KpiCard icon="Phone" label="Calls to Make" value={kpis.callsToMake} accent="indigo" />
      <KpiCard icon="MapPin" label="Visits Planned" value={kpis.visitsPlanned} accent="emerald" />
      <KpiCard icon="DollarSign" label="Revenue at Risk" value={kpis.revenueAtRisk} accent="red" />
      <KpiCard icon="Package" label="Pending Orders" value={kpis.pendingOrders} accent="amber" />
      <KpiCard icon="Wallet" label="Collections" value={kpis.collections} accent="zinc" />
    </div>
  )
}
