import { useContext } from "react"
import { GoogleCalendarContext } from "./google-calendar-context"

export function useGoogleCalendar() {
  const ctx = useContext(GoogleCalendarContext)
  if (!ctx) {
    throw new Error("useGoogleCalendar must be used within GoogleCalendarProvider")
  }
  return ctx
}
