import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { EventSourceBadge } from "../../calendar/components/EventSourceBadge"
import { formatEventTimeRange } from "../../calendar/utils"

const LIMIT = 5

function TodayEventRow({ event }) {
  const isGoogle = event.source === "google"
  const row = (
    <div className="flex items-start gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-[13px] font-medium text-zinc-200">{event.title}</p>
          <EventSourceBadge source={event.source} className="text-[10px] normal-case tracking-normal" />
        </div>
        <p className="truncate text-xs text-zinc-500">{formatEventTimeRange(event)}</p>
      </div>
      {isGoogle && event.htmlLink && (
        <ExternalLink size={14} className="mt-1 shrink-0 text-zinc-600" aria-hidden="true" />
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
    <Card padding="md" className="flex min-h-[220px] flex-col">
      <SectionHeader title="Today's Calendar" count={eventsToday.length} />
      {eventsToday.length === 0 ? (
        <SectionEmpty>No calendar events today.</SectionEmpty>
      ) : (
        <>
          <div className="space-y-1.5">
            {visible.map((event) => (
              <TodayEventRow key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-2 flex justify-end">
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
