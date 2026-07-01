import { useCallback, useEffect, useState } from "react"
import { Bug, RefreshCw } from "lucide-react"
import { Card, CardHeader } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { debugGoogleWorkspaceAccess } from "../../../lib/supabase/auth"

function ProbeRow({ label, probe }) {
  const status = probe?.ok ? "success" : "error"
  const statusLabel = probe?.ok ? "success" : "error"

  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`text-sm font-medium ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>
        {statusLabel}
      </p>
      {!probe?.ok && probe?.error && (
        <p className="mt-1 break-words text-xs text-zinc-500">{probe.error}</p>
      )}
    </div>
  )
}

export function GoogleWorkspaceDebugSection() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)

  const runDebug = useCallback(async () => {
    setLoading(true)
    try {
      const result = await debugGoogleWorkspaceAccess()
      setReport(result)
      console.info("[Max OS Google Workspace Debug]", result)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadDebugReport() {
      setLoading(true)
      try {
        const result = await debugGoogleWorkspaceAccess()
        if (!cancelled) {
          setReport(result)
          console.info("[Max OS Google Workspace Debug]", result)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDebugReport()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Card padding="md" className="border-amber-900/30 bg-amber-950/5">
      <CardHeader
        title="Google Workspace Debug"
        description="Temporary scope probe for Calendar and Gmail provider_token access."
      />
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
            <p className="text-xs text-zinc-500">Has provider_token</p>
            <p className="text-sm font-medium text-zinc-200">
              {report ? (report.hasProviderToken ? "yes" : "no") : "…"}
            </p>
          </div>
          <ProbeRow label="Calendar API probe (calendarList)" probe={report?.calendar} />
          <ProbeRow label="Gmail API probe (profile)" probe={report?.gmail} />
          {report?.oauthOptions && (
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3 sm:col-span-2">
              <p className="text-xs text-zinc-500">OAuth scopes string</p>
              <p className="mt-1 break-all font-mono text-[11px] text-zinc-400">
                {report.oauthOptions.scopes}
              </p>
              <p className="mt-2 text-xs text-zinc-500">redirectTo</p>
              <p className="break-all font-mono text-[11px] text-zinc-400">
                {report.oauthOptions.redirectTo}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={loading ? RefreshCw : Bug}
            onClick={runDebug}
            loading={loading}
          >
            Run probe
          </Button>
        </div>
      </div>
    </Card>
  )
}
