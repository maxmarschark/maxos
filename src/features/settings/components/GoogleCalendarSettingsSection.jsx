import { Calendar, RefreshCw } from "lucide-react"
import { Card, CardHeader } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { useToast } from "../../../components/ui/useToast"
import { useAuth } from "../../auth/useAuth"
import { useGoogleCalendar } from "../../google-calendar/useGoogleCalendar"
import { GOOGLE_CALENDAR_STATUS } from "../../google-calendar/constants"
import { getUserEmail } from "../../../lib/supabase/auth"

const statusLabels = {
  [GOOGLE_CALENDAR_STATUS.CONNECTED]: "Connected",
  [GOOGLE_CALENDAR_STATUS.NOT_CONNECTED]: "Not connected",
  [GOOGLE_CALENDAR_STATUS.PERMISSION_NEEDED]: "Permission needed",
}

function formatFetchedDate(iso) {
  if (!iso) return "Never"
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return "Unknown"
  }
}

export function GoogleCalendarSettingsSection() {
  const { toast } = useToast()
  const { user, configured: authConfigured } = useAuth()
  const {
    status,
    loading,
    lastFetchedAt,
    connect,
    refreshEvents,
    error,
  } = useGoogleCalendar()

  const googleAccount = getUserEmail(user)
  const statusLabel = statusLabels[status] ?? "Not connected"
  const isConnected = status === GOOGLE_CALENDAR_STATUS.CONNECTED

  async function handleConnect() {
    if (!authConfigured) {
      toast("Configure Supabase and sign in with Google first", "error")
      return
    }
    const result = await connect()
    if (!result.ok) {
      toast(result.error ?? "Could not connect Google Calendar", "error")
    }
  }

  async function handleRefresh() {
    const result = await refreshEvents()
    if (result.ok) {
      toast("Google Calendar refreshed")
      return
    }
    if (result.reason === "permission_needed") {
      toast("Calendar permission required — click Connect Google Calendar", "error")
      return
    }
    toast(error ?? "Could not refresh Google Calendar", "error")
  }

  return (
    <Card padding="md">
      <CardHeader
        title="Google Calendar"
        description="Sync upcoming events from your Google Calendar into Max OS."
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2">
          <Calendar size={16} className="mt-0.5 shrink-0 text-zinc-500" />
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
              <p className="text-xs text-zinc-500">Status</p>
              <p className="text-sm font-medium text-zinc-200">{statusLabel}</p>
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
              <p className="text-xs text-zinc-500">Google account</p>
              <p className="truncate text-sm font-medium text-zinc-200">
                {authConfigured && googleAccount ? googleAccount : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3 sm:col-span-2">
              <p className="text-xs text-zinc-500">Last fetched</p>
              <p className="text-sm font-medium text-zinc-200">{formatFetchedDate(lastFetchedAt)}</p>
            </div>
          </div>
        </div>

        {!authConfigured && (
          <p className="text-sm text-zinc-500">
            Supabase is not configured. Add env vars and sign in with Google to connect your calendar.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!isConnected && (
            <Button
              variant="primary"
              size="sm"
              icon={Calendar}
              onClick={handleConnect}
              disabled={loading}
            >
              Connect Google Calendar
            </Button>
          )}
          {isConnected && (
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh events
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </Card>
  )
}
