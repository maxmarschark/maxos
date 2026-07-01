import { connectGoogleGmail } from "../../lib/supabase/auth"
import { GMAIL_STATUS } from "./constants"

export const defaultGmailContext = {
  emails: [],
  importantEmails: [],
  status: GMAIL_STATUS.NOT_CONNECTED,
  loading: false,
  lastFetchedAt: null,
  error: null,
  optIn: false,
  refreshInbox: async () => ({ ok: false, reason: "not_available" }),
  connect: connectGoogleGmail,
}
