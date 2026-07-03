import { ConfirmModal } from "../../../components/ui/ConfirmModal"

export function DeleteDealModal({ open, onClose, onConfirm, dealTitle }) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Deal"
      description={`Are you sure you want to delete "${dealTitle}"?`}
      confirmLabel="Delete Deal"
    >
      <p className="text-sm text-zinc-500">
        This deal will be removed from your pipeline.
      </p>
    </ConfirmModal>
  )
}
