import { AlertTriangle } from "lucide-react"
import { Modal } from "./Modal"
import { Button } from "./Button"

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children ?? (
        <div className="flex items-start gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <p className="text-sm text-zinc-400">
            This action cannot be undone. Please confirm to continue.
          </p>
        </div>
      )}
    </Modal>
  )
}
