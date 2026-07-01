import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"

export function DeleteOrderModal({ open, onClose, onConfirm, orderNumber }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Order"
      description={`Are you sure you want to delete order #${orderNumber}? This action cannot be undone.`}
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
            Delete Order
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-500">
        Commission and payment records for this order will be removed.
      </p>
    </Modal>
  )
}
