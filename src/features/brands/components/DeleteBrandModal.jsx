import { ConfirmModal } from "../../../components/ui/ConfirmModal"

export function DeleteBrandModal({ open, onClose, onConfirm, brandName }) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Brand"
      description={`Are you sure you want to delete "${brandName}"?`}
      confirmLabel="Delete Brand"
    >
      <p className="text-sm text-zinc-500">
        All products and notes associated with this brand will also be removed.
      </p>
    </ConfirmModal>
  )
}
