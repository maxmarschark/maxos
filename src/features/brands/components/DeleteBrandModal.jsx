import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"

export function DeleteBrandModal({ open, onClose, onConfirm, brandName }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Brand"
      description={`Are you sure you want to delete "${brandName}"? This action cannot be undone.`}
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
            Delete Brand
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-500">
        All products and notes associated with this brand will also be removed.
      </p>
    </Modal>
  )
}
