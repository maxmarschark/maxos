import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"

export function ClearAllDataModal({ open, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState("")

  function handleClose() {
    setConfirmText("")
    onClose()
  }

  function handleConfirm() {
    onConfirm()
    setConfirmText("")
    onClose()
  }

  const canConfirm = confirmText === "DELETE"

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Clear All App Data"
      description="Permanently delete all Max OS accounts, contacts, brands, orders, and commissions."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={!canConfirm}>
            Clear All Data
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-zinc-500">
          This removes only Max OS data keys from localStorage. Sidebar preferences and
          navigation settings are kept.
        </p>
        <p className="text-sm text-zinc-500">
          Type <span className="font-mono text-zinc-300">DELETE</span> to confirm.
        </p>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
        />
      </div>
    </Modal>
  )
}
