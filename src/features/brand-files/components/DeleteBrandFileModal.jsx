import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"

export function DeleteBrandFileModal({ open, onClose, onConfirm, fileName }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete File"
      description={`Are you sure you want to delete "${fileName}"?`}
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
            Delete File
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-500">
        This removes the asset from storage and your brand vault permanently.
      </p>
    </Modal>
  )
}
