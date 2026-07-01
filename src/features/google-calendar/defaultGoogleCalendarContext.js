import { connectGoogleCalendar } from "../../lib/supabase/auth"
import { GOOGLE_CALENDAR_STATUS } from "./constants"

export const defaultGoogleCalendarContext = {
  googleEvents: [],
  status: GOOGLE_CALENDAR_STATUS.NOT_CONNECTED,
  loading: false,
  lastFetchedAt: null,
  error: null,
  optIn: false,
  refreshEvents: async () => ({ ok: false, reason: "not_available" }),
  connect: connectGoogleCalendar,
}
