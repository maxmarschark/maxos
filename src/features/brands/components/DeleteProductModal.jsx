import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"

export function DeleteProductModal({ open, onClose, onConfirm, productName }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Product"
      description={`Are you sure you want to delete "${productName}"?`}
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
            Delete Product
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-500">This product will be permanently removed from the brand catalog.</p>
    </Modal>
  )
}
