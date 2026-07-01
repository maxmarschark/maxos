import { useState } from "react"
import { Link } from "react-router-dom"
import { ListOrdered, Sparkles } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { Badge } from "../../../components/ui/Badge"
import { LoadingState } from "../../../components/ui/Loading"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { useTodayBuild } from "../useTodayBuild"

const PRIORITY_LIMIT = 5

const priorityVariants = {
  0: "success",
  1: "danger",
  2: "warning",
  3: "primary",
  4: "default",
  5: "default",
}

const priorityLabels = {
  0: "Calendar",
  1: "Urgent",
  2: "Collections",
  3: "Follow-ups",
  4: "Orders",
  5: "Admin",
}

function formatGeneratedTime(date) {
  if (!date) return ""
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function ActionRowContent({ action }) {
  return (
    <>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-[11px] font-semibold text-indigo-400">
        {action.order}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-[13px] font-medium text-zinc-100">{action.label}</p>
          <Badge variant={priorityVariants[action.priority]} className="text-[10px]">
            {priorityLabels[action.priority]}
          </Badge>
        </div>
        {action.detail && (
          <p className="mt-0.5 truncate text-xs text-zinc-500">{action.detail}</p>
        )}
      </div>
    </>
  )
}

export function BuildMyDayPanel() {
  const { plan, generatedAt, isBuilding, hasGenerated } = useTodayBuild()
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? plan : plan.slice(0, PRIORITY_LIMIT)

  return (
    <Card
      padding="md"
      className="border-indigo-900/50 bg-gradient-to-br from-indigo-950/20 to-zinc-900/30 shadow-sm shadow-indigo-950/20"
    >
      <SectionHeader
        title="Build My Day"
        count={hasGenerated ? plan.length : null}
        action={
          hasGenerated && plan.length > 0 ? (
            <Badge variant="primary" className="gap-1 normal-case tracking-normal">
              <ListOrdered size={12} />
              Priority queue
            </Badge>
          ) : null
        }
      />

      {isBuilding && (
        <LoadingState message="Building your plan…" className="py-8" />
      )}

      {!isBuilding && hasGenerated && generatedAt && (
        <p className="mb-3 text-xs text-zinc-500">
          Plan generated at {formatGeneratedTime(generatedAt)}
        </p>
      )}

      {!isBuilding && !hasGenerated && (
        <div className="flex items-start gap-3 rounded-lg border border-indigo-900/30 bg-indigo-950/20 px-4 py-3 text-sm text-zinc-400">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-indigo-400" />
          <p>
            Click <span className="font-medium text-zinc-200">Build My Day</span> in the
            header to generate your prioritized action list.
          </p>
        </div>
      )}

      {!isBuilding && hasGenerated && plan.length > 0 && (
        <>
          <ol className="space-y-1.5">
            {visible.map((action) => (
              <li key={action.order}>
                {action.externalLink ? (
                  <a
                    href={action.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-950/50 px-3 py-2.5 transition-colors hover:border-indigo-800/60 hover:bg-zinc-900/50"
                  >
                    <ActionRowContent action={action} />
                  </a>
                ) : (
                  <Link
                    to={action.link}
                    className="flex items-start gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-950/50 px-3 py-2.5 transition-colors hover:border-indigo-800/60 hover:bg-zinc-900/50"
                  >
                    <ActionRowContent action={action} />
                  </Link>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-2 flex justify-end">
            <ViewAllToggle
              expanded={expanded}
              total={plan.length}
              limit={PRIORITY_LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
