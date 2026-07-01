import { useState } from "react"
import { CalendarPlus } from "lucide-react"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { TaskFormModal } from "./TaskFormModal"
import { getTodayISO } from "../../today/utils"

export function CreateFollowUpButton({
  label = "Schedule Follow-up",
  initialValues,
  accounts,
  contacts,
  brands,
  orders,
  onCreate,
  onCreated,
  variant = "secondary",
  size = "sm",
}) {
  const [open, setOpen] = useState(false)
  const [dueDate, setDueDate] = useState(getTodayISO())

  function handleQuickOpen() {
    setOpen(true)
  }

  function handleSubmit(data) {
    onCreate({ ...data, dueDate: data.dueDate || dueDate })
    onCreated?.()
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <label htmlFor="follow-up-date" className="text-xs font-medium text-zinc-400">
            Follow-up date
          </label>
          <Input
            id="follow-up-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>
        <Button variant={variant} size={size} icon={CalendarPlus} onClick={handleQuickOpen}>
          {label}
        </Button>
      </div>

      <TaskFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initialValues={{ ...initialValues, dueDate }}
        accounts={accounts}
        contacts={contacts}
        brands={brands}
        orders={orders}
      />
    </>
  )
}
