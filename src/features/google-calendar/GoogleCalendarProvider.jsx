import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchGoogleCalendarEvents, getCalendarWindow } from "../../lib/google/calendarApi"
import { getGoogleAccessToken, connectGoogleCalendar as requestCalendarAccess } from "../../lib/supabase/auth"
import { useAuth } from "../auth/useAuth"
import {
  GOOGLE_CALENDAR_OPT_IN_KEY,
  GOOGLE_CALENDAR_STATUS,
  UPCOMING_DAYS,
} from "./constants"
import { GoogleCalendarContext } from "./google-calendar-context"

function loadOptIn() {
  try {
    return localStorage.getItem(GOOGLE_CALENDAR_OPT_IN_KEY) === "true"
  } catch {
    return false
  }
}

function saveOptIn(value) {
  try {
    localStorage.setItem(GOOGLE_CALENDAR_OPT_IN_KEY, value ? "true" : "false")
  } catch {
    /* ignore */
  }
}

export function GoogleCalendarProvider({ children }) {
  const { user, configured } = useAuth()
  const [optIn, setOptIn] = useState(loadOptIn)
  const [googleEvents, setGoogleEvents] = useState([])
  const [status, setStatus] = useState(GOOGLE_CALENDAR_STATUS.NOT_CONNECTED)
  const [loading, setLoading] = useState(false)
  const [lastFetchedAt, setLastFetchedAt] = useState(null)
  const [error, setError] = useState(null)

  const refreshEvents = useCallback(async () => {
    if (!configured || !user) {
      setStatus(GOOGLE_CALENDAR_STATUS.NOT_CONNECTED)
      setGoogleEvents([])
      return { ok: false, reason: "not_signed_in" }
    }

    setLoading(true)
    setError(null)

    const token = await getGoogleAccessToken()
    if (!token) {
      setLoading(false)
      setGoogleEvents([])
      setStatus(
        optIn ? GOOGLE_CALENDAR_STATUS.PERMISSION_NEEDED : GOOGLE_CALENDAR_STATUS.NOT_CONNECTED
      )
      return { ok: false, reason: "no_token" }
    }

    const window = getCalendarWindow(UPCOMING_DAYS)
    const result = await fetchGoogleCalendarEvents(token, window)

    setLoading(false)

    if (!result.ok) {
      setGoogleEvents([])
      setError(result.error ?? "Failed to load Google Calendar")
      setStatus(
        result.reason === "permission_needed"
          ? GOOGLE_CALENDAR_STATUS.PERMISSION_NEEDED
          : GOOGLE_CALENDAR_STATUS.NOT_CONNECTED
      )
      return result
    }

    setGoogleEvents(result.events)
    setLastFetchedAt(new Date().toISOString())
    setStatus(GOOGLE_CALENDAR_STATUS.CONNECTED)
    return result
  }, [configured, user, optIn])

  const connect = useCallback(async () => {
    saveOptIn(true)
    setOptIn(true)
    const result = await requestCalendarAccess()
    if (!result.ok) {
      setError(result.error ?? "Could not start Google Calendar authorization")
    }
    return result
  }, [])

  useEffect(() => {
    let cancelled = false

    async function syncGoogleCalendar() {
      if (!configured || !user) {
        if (!cancelled) {
          setGoogleEvents([])
          setStatus(GOOGLE_CALENDAR_STATUS.NOT_CONNECTED)
        }
        return
      }

      if (optIn) {
        await refreshEvents()
      } else if (!cancelled) {
        setStatus(GOOGLE_CALENDAR_STATUS.NOT_CONNECTED)
      }
    }

    void syncGoogleCalendar()
    return () => {
      cancelled = true
    }
  }, [configured, user, optIn, refreshEvents])

  const value = useMemo(
    () => ({
      googleEvents,
      status,
      loading,
      lastFetchedAt,
      error,
      optIn,
      refreshEvents,
      connect,
    }),
    [googleEvents, status, loading, lastFetchedAt, error, optIn, refreshEvents, connect]
  )

  return (
    <GoogleCalendarContext.Provider value={value}>{children}</GoogleCalendarContext.Provider>
  )
}
