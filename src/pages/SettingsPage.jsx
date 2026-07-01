import { useRef, useState } from "react"
import { Settings, Download, Upload, FileSpreadsheet, AlertTriangle, Info, Cloud } from "lucide-react"
import { PageHeader } from "../components/ui/PageHeader"
import { Card, CardHeader } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { StorageModeBadge } from "../components/ui/StorageModeBadge"
import { useToast } from "../components/ui/useToast"
import { useAuth } from "../features/auth/useAuth"
import { useAccounts } from "../features/accounts/useAccounts"
import { useCloudSync } from "../features/cloud/useCloudSync"
import { GoogleCalendarSettingsSection } from "../features/settings/components/GoogleCalendarSettingsSection"
import { GmailSettingsSection } from "../features/settings/components/GmailSettingsSection"
import {
  APP_VERSION,
  estimateStorageUsageBytes,
  formatBytes,
  getLastBackupDate,
  loadAllAppData,
} from "../lib/maxOsStorage"
import {
  exportBackup,
  parseBackupFile,
  validateBackup,
  getBackupPreview,
  restoreBackup,
  clearAllAppData,
} from "../features/settings/backup"
import {
  exportAccountsCsv,
  exportContactsCsv,
  exportBrandsCsv,
  exportOrdersCsv,
  exportCommissionsCsv,
} from "../features/settings/csvExports"
import { RestoreBackupModal } from "../features/settings/components/RestoreBackupModal"
import { ClearAllDataModal } from "../features/settings/components/ClearAllDataModal"

function SettingsSection({ title, description, children, danger = false }) {
  return (
    <Card
      padding="md"
      className={danger ? "border-red-900/40 bg-red-950/5" : undefined}
    >
      <CardHeader title={title} description={description} />
      {children}
    </Card>
  )
}

function formatSyncDate(iso) {
  if (!iso) return "Never"
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return "Unknown"
  }
}

function formatBackupDate(iso) {
  if (!iso) return "Never"
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return "Unknown"
  }
}

function formatConnectedUser(user) {
  if (!user) return "—"
  return user.email ?? user.id ?? "—"
}

export function SettingsPage() {
  const { toast } = useToast()
  const { user, configured: authConfigured } = useAuth()
  const { storageMode } = useAccounts()
  const { connected, lastSync, projectName, connectedUser, checking } = useCloudSync()
  const fileInputRef = useRef(null)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [pendingBackup, setPendingBackup] = useState(null)
  const [restorePreview, setRestorePreview] = useState(null)
  const [restoreErrors, setRestoreErrors] = useState([])

  const lastBackup = getLastBackupDate()
  const storageBytes = estimateStorageUsageBytes()
  const currentData = loadAllAppData()

  function handleExportBackup() {
    exportBackup()
    toast("Backup downloaded successfully")
  }

  function handleRestoreClick() {
    fileInputRef.current?.click()
  }

  function handleFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = parseBackupFile(String(reader.result))
        const validation = validateBackup(parsed)
        if (!validation.valid) {
          setPendingBackup(null)
          setRestorePreview(null)
          setRestoreErrors(validation.errors)
          setRestoreOpen(true)
          return
        }
        setPendingBackup(parsed)
        setRestorePreview(getBackupPreview(parsed))
        setRestoreErrors([])
        setRestoreOpen(true)
      } catch (err) {
        setPendingBackup(null)
        setRestorePreview(null)
        setRestoreErrors([err.message ?? "Failed to read backup file."])
        setRestoreOpen(true)
      }
    }
    reader.onerror = () => {
      toast("Failed to read file", "error")
    }
    reader.readAsText(file)
  }

  function handleConfirmRestore() {
    if (!pendingBackup) return
    try {
      restoreBackup(pendingBackup)
      toast("Backup restored — reloading…")
      window.setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      toast(err.message ?? "Restore failed", "error")
    }
  }

  function handleClearAll() {
    clearAllAppData()
    toast("All app data cleared — reloading…")
    window.setTimeout(() => window.location.reload(), 800)
  }

  function handleCloseRestore() {
    setRestoreOpen(false)
    setPendingBackup(null)
    setRestorePreview(null)
    setRestoreErrors([])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Backup, restore, and manage your local Max OS data"
        badge={<StorageModeBadge mode={storageMode} />}
      />

      <SettingsSection
        title="Cloud Sync (Supabase)"
        description="Authentication and cloud persistence status."
      >
        <div className="flex items-start gap-2">
          <Cloud size={16} className="mt-0.5 shrink-0 text-zinc-500" />
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
              <p className="text-xs text-zinc-500">Authenticated user</p>
              <p className="truncate text-sm font-medium text-zinc-200">
                {authConfigured ? (user?.email ?? "—") : "Not required (local-only)"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
              <p className="text-xs text-zinc-500">Supabase connected</p>
              <p className="text-sm font-medium text-zinc-200">
                {checking ? "Checking…" : connected ? "Yes" : "No"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
              <p className="text-xs text-zinc-500">Current data mode</p>
              <div className="mt-1">
                <StorageModeBadge mode={storageMode} />
              </div>
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
              <p className="text-xs text-zinc-500">Last Sync</p>
              <p className="text-sm font-medium text-zinc-200">{formatSyncDate(lastSync)}</p>
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
              <p className="text-xs text-zinc-500">Project Name</p>
              <p className="text-sm font-medium text-zinc-200">{projectName}</p>
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
              <p className="text-xs text-zinc-500">Database user</p>
              <p className="truncate text-sm font-medium text-zinc-200">
                {formatConnectedUser(connectedUser ?? user)}
              </p>
            </div>
          </div>
        </div>
      </SettingsSection>

      <GoogleCalendarSettingsSection />

      <GmailSettingsSection />

      <SettingsSection
        title="Data Backup"
        description="Download a complete JSON snapshot of all Max OS data stored in this browser."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            Includes accounts (with tasks & notes), contacts, brands, orders, commissions,
            and import history.
          </p>
          <Button variant="primary" size="sm" icon={Download} onClick={handleExportBackup}>
            Export JSON Backup
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Data Restore"
        description="Upload a previously exported Max OS backup file to replace current data."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            File is validated before import. You must confirm before data is replaced.
          </p>
          <Button variant="secondary" size="sm" icon={Upload} onClick={handleRestoreClick}>
            Upload Backup
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileSelected}
        />
      </SettingsSection>

      <SettingsSection
        title="Export CSV"
        description="Download individual modules as spreadsheet-friendly CSV files."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={exportAccountsCsv}>
            Accounts
          </Button>
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={exportContactsCsv}>
            Contacts
          </Button>
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={exportBrandsCsv}>
            Brands
          </Button>
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={exportOrdersCsv}>
            Orders
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={exportCommissionsCsv}
          >
            Commissions
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Danger Zone"
        description="Permanently remove all Max OS data from this browser."
        danger
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-zinc-500">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
            <p>
              This cannot be undone. Export a backup first. Only Max OS data keys are
              removed — not sidebar or navigation preferences.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setClearOpen(true)}>
            Clear All Data
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="App Info" description="Local installation details">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
            <Info size={16} className="mt-0.5 shrink-0 text-indigo-400" />
            <div>
              <p className="text-xs text-zinc-500">Version</p>
              <p className="text-sm font-medium text-zinc-200">{APP_VERSION}</p>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
            <p className="text-xs text-zinc-500">Last backup</p>
            <p className="text-sm font-medium text-zinc-200">{formatBackupDate(lastBackup)}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
            <p className="text-xs text-zinc-500">localStorage usage (estimate)</p>
            <p className="text-sm font-medium text-zinc-200">{formatBytes(storageBytes)}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
            <p className="text-xs text-zinc-500">Current records</p>
            <p className="text-sm font-medium text-zinc-200">
              {currentData.accounts.length} accounts · {currentData.contacts.length} contacts ·{" "}
              {currentData.orders.length} orders · {currentData.tasks?.length ?? 0} tasks
            </p>
          </div>
        </div>
      </SettingsSection>

      <RestoreBackupModal
        open={restoreOpen}
        onClose={handleCloseRestore}
        onConfirm={handleConfirmRestore}
        preview={restorePreview}
        errors={restoreErrors}
      />

      <ClearAllDataModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleClearAll}
      />
    </div>
  )
}
