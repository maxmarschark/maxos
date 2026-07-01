import { Calendar, RefreshCw } from "lucide-react"
import { getRouteById } from "../config/routes"
import { PageHeader } from "../components/ui/PageHeader"
import { StorageModeBadge } from "../components/ui/StorageModeBadge"
import { useCalendar } from "../features/calendar/useCalendar"
import { CalendarEventsList } from "../features/calendar/components/CalendarEventsList"
import { useGoogleCalendar } from "../features/google-calendar/useGoogleCalendar"
import { GOOGLE_CALENDAR_STATUS } from "../features/google-calendar/constants"

const statusLabels = {
  [GOOGLE_CALENDAR_STATUS.CONNECTED]: "Connected",
  [GOOGLE_CALENDAR_STATUS.NOT_CONNECTED]: "Not connected",
  [GOOGLE_CALENDAR_STATUS.PERMISSION_NEEDED]: "Permission needed",
}

export function CalendarPage() {
  const route = getRouteById("calendar")
  const { storageMode } = useCalendar()
  const { status, loading, refreshEvents } = useGoogleCalendar()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={route.icon}
        title={route.name}
        description={route.description}
        badge={<StorageModeBadge mode={storageMode} />}
        actions={
          status === GOOGLE_CALENDAR_STATUS.CONNECTED ? (
            <button
              type="button"
              onClick={() => void refreshEvents()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800/40 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : undefined} />
              Refresh Google
            </button>
          ) : null
        }
      />

      <div className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3 text-sm">
        <Calendar size={16} className="shrink-0 text-zinc-500" />
        <span className="text-zinc-500">Google Calendar:</span>
        <span className="font-medium text-zinc-200">{statusLabels[status] ?? status}</span>
      </div>

      <CalendarEventsList />
    </div>
  )
}
