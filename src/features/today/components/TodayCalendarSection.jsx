import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { EventSourceBadge } from "../../calendar/components/EventSourceBadge"
import { formatEventTimeRange } from "../../calendar/utils"
import {
  dashboardCardClass,
  dashboardFooterClass,
  dashboardListClass,
  dashboardRowClass,
} from "./dashboardLayout"
import { cn } from "../../../lib/cn"

const LIMIT = 5

function TodayEventRow({ event }) {
  const isGoogle = event.source === "google"
  const row = (
    <div className={cn(dashboardRowClass, "flex gap-2")}>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-200">
          {event.title}
        </p>
        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          <EventSourceBadge
            source={event.source}
            className="shrink-0 text-[10px] normal-case tracking-normal"
          />
          <p className="truncate text-xs text-zinc-500">{formatEventTimeRange(event)}</p>
        </div>
      </div>
      {isGoogle && event.htmlLink && (
        <ExternalLink size={14} className="mt-0.5 shrink-0 text-zinc-600" aria-hidden="true" />
      )}
    </div>
  )

  if (isGoogle && event.htmlLink) {
    return (
      <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="block">
        {row}
      </a>
    )
  }

  return row
}

export function TodayCalendarSection({ eventsToday }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? eventsToday : eventsToday.slice(0, LIMIT)

  return (
    <Card padding="md" className={dashboardCardClass}>
      <SectionHeader title="Today's Calendar" count={eventsToday.length} />
      {eventsToday.length === 0 ? (
        <SectionEmpty centered>No calendar events today.</SectionEmpty>
      ) : (
        <>
          <div className={dashboardListClass}>
            {visible.map((event) => (
              <TodayEventRow key={event.id} event={event} />
            ))}
          </div>
          <div className={dashboardFooterClass}>
            <ViewAllToggle
              expanded={expanded}
              total={eventsToday.length}
              limit={LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
