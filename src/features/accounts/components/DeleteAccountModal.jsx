import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"

export function DeleteAccountModal({ open, onClose, onConfirm, accountName }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Account"
      description={`Are you sure you want to delete "${accountName}"? This action cannot be undone.`}
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
            Delete Account
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-500">
        All notes and tasks associated with this account will also be removed.
      </p>
    </Modal>
  )
}
