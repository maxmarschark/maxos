import { ConfirmModal } from "../../../components/ui/ConfirmModal"

export function DeleteAccountModal({ open, onClose, onConfirm, accountName }) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Account"
      description={`Are you sure you want to delete "${accountName}"?`}
      confirmLabel="Delete Account"
    >
      <p className="text-sm text-zinc-500">
        All notes and tasks associated with this account will also be removed.
      </p>
    </ConfirmModal>
  )
}
