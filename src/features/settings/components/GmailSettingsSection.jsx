import { Mail, RefreshCw } from "lucide-react"
import { Card, CardHeader } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { useToast } from "../../../components/ui/useToast"
import { useAuth } from "../../auth/useAuth"
import { useGmail } from "../../gmail/useGmail"
import { GMAIL_STATUS } from "../../gmail/constants"
import { getUserEmail } from "../../../lib/supabase/auth"

const statusLabels = {
  [GMAIL_STATUS.CONNECTED]: "Connected",
  [GMAIL_STATUS.NOT_CONNECTED]: "Not connected",
  [GMAIL_STATUS.PERMISSION_NEEDED]: "Permission needed",
}

function formatFetchedDate(iso) {
  if (!iso) return "Never"
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return "Unknown"
  }
}

export function GmailSettingsSection() {
  const { toast } = useToast()
  const { user, configured: authConfigured } = useAuth()
  const { status, loading, lastFetchedAt, refreshInbox, error } = useGmail()

  const googleAccount = getUserEmail(user)
  const statusLabel = statusLabels[status] ?? "Not connected"
  const isConnected = status === GMAIL_STATUS.CONNECTED

  async function handleRefresh() {
    const result = await refreshInbox()
    if (result.ok) {
      toast("Gmail inbox refreshed")
      return
    }
    if (result.reason === "permission_needed") {
      toast("Gmail permission required — click Connect Google Workspace in Calendar settings", "error")
      return
    }
    toast(error ?? "Could not refresh Gmail", "error")
  }

  return (
    <Card padding="md">
      <CardHeader
        title="Gmail"
        description="Read unread inbox messages using your existing Google sign-in."
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2">
          <Mail size={16} className="mt-0.5 shrink-0 text-zinc-500" />
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
            Supabase is not configured. Add env vars and sign in with Google to connect Gmail.
          </p>
        )}

        {isConnected && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh inbox
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </Card>
  )
}
