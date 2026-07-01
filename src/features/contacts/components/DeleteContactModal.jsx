import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"

export function DeleteContactModal({ open, onClose, onConfirm, contactName }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Contact"
      description={`Are you sure you want to delete "${contactName}"? This action cannot be undone.`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Delete Contact
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-500">
        Follow-up history and notes for this contact will be removed.
      </p>
    </Modal>
  )
}
