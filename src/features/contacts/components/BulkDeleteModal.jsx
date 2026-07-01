import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"

export function BulkDeleteModal({ open, onClose, onConfirm, count }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Selected Contacts"
      description={`Are you sure you want to delete ${count} selected contact${count !== 1 ? "s" : ""}? This action cannot be undone.`}
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
            Delete {count} Contact{count !== 1 ? "s" : ""}
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-500">
        Follow-up history and notes for these contacts will be removed.
      </p>
    </Modal>
  )
}
