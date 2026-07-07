import { useState } from "react"
import { Link } from "react-router-dom"
import { Package, UserPlus, Building2, DollarSign, CheckSquare, Phone, StickyNote, Pencil, Tag } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import {
  dashboardCardClass,
  dashboardFooterClass,
  dashboardListClass,
} from "./dashboardLayout"

const LIMIT = 5

const typeIcons = {
  account_created: Building2,
  account_edited: Pencil,
  order_created: Package,
  order_updated: Package,
  contact_added: UserPlus,
  commission_paid: DollarSign,
  task_created: CheckSquare,
  task_completed: CheckSquare,
  follow_up_logged: Phone,
  note_added: StickyNote,
  brand_created: Tag,
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

export function ActivityFeed({ activity }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? activity : activity.slice(0, LIMIT)

  return (
    <Card padding="md" className={dashboardCardClass}>
      <SectionHeader title="Activity Feed" count={activity.length} />
      {activity.length === 0 ? (
        <SectionEmpty centered>No recent activity.</SectionEmpty>
      ) : (
        <>
          <div className={dashboardListClass}>
            {visible.map((event) => {
              const Icon = typeIcons[event.type] ?? Package
              return (
                <Link
                  key={event.id}
                  to={event.link}
                  className="flex items-center gap-2.5 rounded-md px-1.5 py-2 transition-colors hover:bg-zinc-800/40"
                >
                  <Icon size={13} className="shrink-0 text-zinc-600" />
                  <p className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">
                    {event.label}
                  </p>
                  <span className="shrink-0 text-[11px] text-zinc-600">
                    {formatActivityTime(event.timestamp)}
                  </span>
                </Link>
              )
            })}
          </div>
          <div className={dashboardFooterClass}>
            <ViewAllToggle
              expanded={expanded}
              total={activity.length}
              limit={LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
