import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"

export function ClearAllContactsModal({ open, onClose, onConfirm, contactCount }) {
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
      title="Clear All Contacts"
      description={`This will permanently delete all ${contactCount} contact${contactCount !== 1 ? "s" : ""} and import history.`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={!canConfirm}>
            Clear All Contacts
          </Button>
        </>
      }
    >
      <div className="space-y-3">
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
