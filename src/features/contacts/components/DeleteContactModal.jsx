import { ConfirmModal } from "../../../components/ui/ConfirmModal"

export function DeleteContactModal({ open, onClose, onConfirm, contactName }) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Contact"
      description={`Are you sure you want to delete "${contactName}"?`}
      confirmLabel="Delete Contact"
    >
      <p className="text-sm text-zinc-500">
        Follow-up history and notes for this contact will be removed.
      </p>
    </ConfirmModal>
  )
}
