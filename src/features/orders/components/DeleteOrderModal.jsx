import { ConfirmModal } from "../../../components/ui/ConfirmModal"

export function DeleteOrderModal({ open, onClose, onConfirm, orderNumber }) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Order"
      description={`Are you sure you want to delete order #${orderNumber}?`}
      confirmLabel="Delete Order"
    >
      <p className="text-sm text-zinc-500">
        Commission and payment records for this order will be removed.
      </p>
    </ConfirmModal>
  )
}
