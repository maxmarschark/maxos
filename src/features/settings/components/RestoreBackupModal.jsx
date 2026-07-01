import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-200">{value}</span>
    </div>
  )
}

export function RestoreBackupModal({ open, onClose, onConfirm, preview, errors = [] }) {
  const hasPreview = preview && errors.length === 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Restore Backup"
      description="This will replace all current Max OS data with the backup contents."
      size="md"
      footer={
        hasPreview ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Restore Backup
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      {errors.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-red-900/50 bg-red-950/20 p-4">
          <p className="text-sm font-medium text-red-300">Backup validation failed</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-400/90">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      ) : (
        preview && (
          <div className="divide-y divide-zinc-800/80 rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-4">
            <PreviewRow label="Accounts" value={preview.accounts} />
            <PreviewRow label="Contacts" value={preview.contacts} />
            <PreviewRow label="Brands" value={preview.brands} />
            <PreviewRow label="Orders" value={preview.orders} />
            <PreviewRow label="Commissions" value={preview.commissions} />
            <PreviewRow label="Tasks" value={preview.tasks} />
            {preview.importBatches > 0 && (
              <PreviewRow label="Import batches" value={preview.importBatches} />
            )}
            {preview.exportedAt && (
              <PreviewRow
                label="Backup created"
                value={new Date(preview.exportedAt).toLocaleString()}
              />
            )}
          </div>
        )
      )}
    </Modal>
  )
}
