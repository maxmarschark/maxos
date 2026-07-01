import { EVENT_SOURCE } from "../../features/google-calendar/constants"

export function parseGoogleCalendarEvent(item) {
  const startRaw = item.start?.dateTime ?? item.start?.date ?? null
  const endRaw = item.end?.dateTime ?? item.end?.date ?? null

  let eventDate = ""
  let eventTime = ""
  let endTime = ""

  if (item.start?.dateTime) {
    const start = new Date(item.start.dateTime)
    eventDate = start.toISOString().slice(0, 10)
    eventTime = formatTimeLocal(start)
  } else if (item.start?.date) {
    eventDate = item.start.date.slice(0, 10)
  }

  if (item.end?.dateTime) {
    endTime = formatTimeLocal(new Date(item.end.dateTime))
  }

  return {
    id: `google-${item.id}`,
    googleEventId: item.id,
    source: EVENT_SOURCE.GOOGLE,
    title: item.summary?.trim() || "(No title)",
    eventDate,
    eventTime,
    endTime,
    eventType: "Meeting",
    notes: item.description ?? "",
    htmlLink: item.htmlLink ?? "",
    location: item.location ?? "",
    allDay: Boolean(item.start?.date && !item.start?.dateTime),
    startIso: startRaw,
    endIso: endRaw,
  }
}

function formatTimeLocal(date) {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

export async function fetchGoogleCalendarEvents(accessToken, { timeMin, timeMax }) {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  })

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      reason: "permission_needed",
      error: `Google Calendar access denied (${response.status})`,
    }
  }

  if (!response.ok) {
    const message = await response.text()
    return {
      ok: false,
      reason: "fetch_failed",
      error: message || response.statusText,
    }
  }

  const data = await response.json()
  return {
    ok: true,
    events: (data.items ?? [])
      .filter((item) => item.status !== "cancelled")
      .map(parseGoogleCalendarEvent),
  }
}

export function getCalendarWindow(daysAhead = 30) {
  const now = new Date()
  const timeMin = now.toISOString()
  const end = new Date(now)
  end.setDate(end.getDate() + daysAhead)
  end.setHours(23, 59, 59, 999)
  return { timeMin, timeMax: end.toISOString() }
}
