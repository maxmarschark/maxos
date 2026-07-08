import { EVENT_SOURCE } from "../google-calendar/constants"

export function withMaxOsSource(events) {
  return events.map((event) => ({
    ...event,
    source: EVENT_SOURCE.MAX_OS,
  }))
}

export function sortEventsByDateTime(events) {
  return [...events].sort((a, b) => {
    const dateCompare = (a.eventDate ?? "").localeCompare(b.eventDate ?? "")
    if (dateCompare !== 0) return dateCompare
    return (a.eventTime ?? "").localeCompare(b.eventTime ?? "")
  })
}

export function mergeCalendarEvents(maxOsEvents, googleEvents) {
  return sortEventsByDateTime([...withMaxOsSource(maxOsEvents), ...googleEvents])
}

export function filterEventsOnDate(events, dateISO) {
  return events.filter((event) => event.eventDate?.slice(0, 10) === dateISO)
}

export function filterUpcomingEvents(events, fromDateISO) {
  return events.filter((event) => {
    if (!event.eventDate) return false
    return event.eventDate.slice(0, 10) >= fromDateISO
  })
}

export function formatEventTimeRange(event) {
  if (event.allDay) return "All day"
  if (event.eventTime && event.endTime) {
    return `${formatDisplayTime(event.eventTime)} – ${formatDisplayTime(event.endTime)}`
  }
  if (event.eventTime) return formatDisplayTime(event.eventTime)
  return "—"
}

export function formatDisplayTime(time24) {
  const [h, m] = time24.split(":").map(Number)
  if (Number.isNaN(h)) return time24
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`
}

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(":").map(Number)
  if (Number.isNaN(h)) return 0
  return h * 60 + (m || 0)
}

export function isTimeOverlapping(startA, endA, startB, endB) {
  return startA < endB && startB < endA
}

/**
 * Returns true if a proposed action time overlaps a calendar block on the same day.
 */
export function conflictsWithCalendarBlocks(blocks, proposedStartMinutes, proposedEndMinutes) {
  return blocks.some((block) => {
    if (!block.eventTime) return false
    const blockStart = timeToMinutes(block.eventTime)
    const blockEnd = block.endTime ? timeToMinutes(block.endTime) : blockStart + 60
    return isTimeOverlapping(proposedStartMinutes, proposedEndMinutes, blockStart, blockEnd)
  })
}
