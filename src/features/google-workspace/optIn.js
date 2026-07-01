import { GOOGLE_CALENDAR_OPT_IN_KEY } from "../google-calendar/constants"
import { GMAIL_OPT_IN_KEY } from "../gmail/constants"

export function saveGoogleWorkspaceOptIn() {
  try {
    localStorage.setItem(GOOGLE_CALENDAR_OPT_IN_KEY, "true")
    localStorage.setItem(GMAIL_OPT_IN_KEY, "true")
  } catch {
    /* ignore */
  }
}
