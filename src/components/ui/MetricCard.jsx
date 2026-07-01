import { memo } from "react"
import { cn } from "../../lib/cn"
import { Card } from "./Card"

const accents = {
  red: "text-red-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  indigo: "text-indigo-400",
  zinc: "text-zinc-100",
}

export const MetricCard = memo(function MetricCard({
  icon: Icon,
  label,
  value,
  meta,
  accent = "zinc",
  className,
}) {
  return (
    <Card
      padding="sm"
      className={cn(
        "flex min-h-[88px] flex-col transition-colors hover:border-zinc-700/60",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-zinc-500">
        {Icon && <Icon size={13} strokeWidth={1.75} />}
        <span className="text-[11px] font-medium leading-tight">{label}</span>
      </div>
      <div className={cn("mt-1.5 text-xl font-semibold tracking-tight", accents[accent])}>
        {value}
      </div>
      {meta && <p className="mt-0.5 text-[11px] text-zinc-600">{meta}</p>}
    </Card>
  )
})
