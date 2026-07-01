import { ConfirmModal } from "../../../components/ui/ConfirmModal"

export function DeleteTaskModal({ open, onClose, onConfirm, taskTitle }) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Task"
      description={`Are you sure you want to delete "${taskTitle}"?`}
      confirmLabel="Delete Task"
    />
  )
}
