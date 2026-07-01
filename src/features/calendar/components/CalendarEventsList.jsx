import { useMemo, useState } from "react"
import { ExternalLink } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { formatDate } from "../../../lib/format"
import { useCalendar } from "../useCalendar"
import { useGoogleCalendar } from "../../google-calendar/useGoogleCalendar"
import { mergeCalendarEvents, filterUpcomingEvents, formatEventTimeRange } from "../utils"
import { EventSourceBadge } from "./EventSourceBadge"
import { getTodayISO } from "../../today/utils"
import { SectionHeader } from "../../today/components/SectionHeader"
import { ViewAllToggle } from "../../today/components/ViewAllToggle"

const LIMIT = 20

function CalendarEventRow({ event }) {
  const isGoogle = event.source === "google"
  const content = (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-[13px] font-medium text-zinc-200">{event.title}</p>
          <EventSourceBadge source={event.source} className="text-[10px] normal-case tracking-normal" />
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          {formatDate(event.eventDate)}
          {event.eventDate ? ` · ${formatEventTimeRange(event)}` : ""}
          {event.eventType ? ` · ${event.eventType}` : ""}
        </p>
        {event.location && (
          <p className="mt-0.5 truncate text-xs text-zinc-600">{event.location}</p>
        )}
      </div>
      {isGoogle && event.htmlLink && (
        <ExternalLink size={14} className="mt-1 shrink-0 text-zinc-600" aria-hidden="true" />
      )}
    </div>
  )

  if (isGoogle && event.htmlLink) {
    return (
      <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="block transition-opacity hover:opacity-90">
        {content}
      </a>
    )
  }

  return content
}

export function CalendarEventsList() {
  const { events: maxOsEvents } = useCalendar()
  const { googleEvents, loading } = useGoogleCalendar()
  const [expanded, setExpanded] = useState(false)

  const upcoming = useMemo(() => {
    const merged = mergeCalendarEvents(maxOsEvents, googleEvents)
    return filterUpcomingEvents(merged, getTodayISO())
  }, [maxOsEvents, googleEvents])

  const visible = expanded ? upcoming : upcoming.slice(0, LIMIT)

  return (
    <Card padding="md">
      <SectionHeader title="Upcoming events" count={upcoming.length} />
      {loading && upcoming.length === 0 ? (
        <SectionEmpty>Loading Google Calendar events…</SectionEmpty>
      ) : upcoming.length === 0 ? (
        <SectionEmpty>No upcoming calendar events.</SectionEmpty>
      ) : (
        <>
          <div className="space-y-1.5">
            {visible.map((event) => (
              <CalendarEventRow key={event.id} event={event} />
            ))}
          </div>
          {upcoming.length > LIMIT && (
            <div className="mt-2 flex justify-end">
              <ViewAllToggle
                expanded={expanded}
                total={upcoming.length}
                limit={LIMIT}
                onToggle={() => setExpanded((v) => !v)}
              />
            </div>
          )}
        </>
      )}
    </Card>
  )
}
