import { Link } from "react-router-dom"
import {
  Package,
  UserPlus,
  Building2,
  DollarSign,
  CheckSquare,
  StickyNote,
  Phone,
  Pencil,
  Tag,
} from "lucide-react"
import { Card } from "../ui/Card"
import { SectionEmpty } from "../ui/SectionEmpty"
import { cn } from "../../lib/cn"

const typeIcons = {
  account_created: Building2,
  brand_created: Tag,
  account_edited: Pencil,
  order_created: Package,
  order_updated: Package,
  contact_added: UserPlus,
  commission_paid: DollarSign,
  task_created: CheckSquare,
  task_completed: CheckSquare,
  follow_up_logged: Phone,
  note_added: StickyNote,
}

function formatActivityTime(timestamp) {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return "—"
  }
}

export function ActivityTimeline({
  events,
  emptyMessage = "No activity yet.",
  className,
  limit,
  showDetail = true,
}) {
  const visible = limit ? events.slice(0, limit) : events

  if (events.length === 0) {
    return (
      <Card padding="md" className={className}>
        <SectionEmpty>{emptyMessage}</SectionEmpty>
      </Card>
    )
  }

  return (
    <Card padding="md" className={className}>
      <div className="space-y-0.5">
        {visible.map((event) => {
          const Icon = typeIcons[event.type] ?? Package
          return (
            <Link
              key={event.id}
              to={event.link}
              className="flex items-start gap-2.5 rounded-md px-1.5 py-2 transition-colors hover:bg-zinc-800/40"
            >
              <Icon size={14} className="mt-0.5 shrink-0 text-zinc-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-zinc-200">{event.label}</p>
                {showDetail && event.detail && (
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{event.detail}</p>
                )}
              </div>
              <span className="shrink-0 text-[11px] text-zinc-600">
                {formatActivityTime(event.timestamp)}
              </span>
            </Link>
          )
        })}
      </div>
      {limit && events.length > limit && (
        <p className="mt-3 text-xs text-zinc-600">
          Showing {limit} of {events.length} events
        </p>
      )}
    </Card>
  )
}

export function ActivityTimelineInline({ events, emptyMessage = "No activity yet." }) {
  if (events.length === 0) {
    return <p className="text-sm text-zinc-600">{emptyMessage}</p>
  }

  return (
    <div className="space-y-1">
      {events.map((event) => (
        <Link
          key={event.id}
          to={event.link}
          className={cn(
            "flex items-center justify-between gap-3 rounded-lg border border-zinc-800/60",
            "bg-zinc-950/40 px-3 py-2 transition-colors hover:border-zinc-700/60"
          )}
        >
          <div className="min-w-0">
            <p className="truncate text-[13px] text-zinc-200">{event.label}</p>
            {event.detail && (
              <p className="truncate text-xs text-zinc-500">{event.detail}</p>
            )}
          </div>
          <span className="shrink-0 text-[11px] text-zinc-600">
            {formatActivityTime(event.timestamp)}
          </span>
        </Link>
      ))}
    </div>
  )
}
