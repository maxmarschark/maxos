import { Sparkles } from "lucide-react"
import { Card, CardHeader } from "../ui/Card"
import { Badge } from "../ui/Badge"

const typeVariants = {
  revenue: "success",
  risk: "danger",
  growth: "primary",
}

export function AIPrioritiesPanel({ priorities }) {
  return (
    <Card padding="md" className="border-indigo-500/15 bg-indigo-500/[0.03]">
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Sparkles size={15} className="text-indigo-400" />
            AI Priorities
          </span>
        }
        description="Ranked by revenue impact and urgency"
      />
      <div className="space-y-3">
        {priorities.map((item, index) => (
          <div
            key={item.id}
            className="rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-3.5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-zinc-600">#{index + 1}</span>
              <Badge variant={typeVariants[item.type]} className="shrink-0">
                {item.confidence}
              </Badge>
            </div>
            <h4 className="mt-1.5 text-[13px] font-medium text-zinc-200">
              {item.title}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
