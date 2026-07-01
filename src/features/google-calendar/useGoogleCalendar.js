import { useContext } from "react"
import { GoogleCalendarContext } from "./google-calendar-context"

export function useGoogleCalendar() {
  return useContext(GoogleCalendarContext)
}
