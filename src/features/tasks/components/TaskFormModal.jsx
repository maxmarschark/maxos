import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Form, FormField } from "../../../components/ui/Form"
import { Input } from "../../../components/ui/Input"
import { Select } from "../../../components/ui/Select"
import { Textarea } from "../../../components/ui/Textarea"
import {
  EMPTY_TASK,
  TASK_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../constants"
import { required, collectErrors, hasErrors } from "../../../lib/validate"

function buildInitialForm(task) {
  if (task) {
    return {
      title: task.title,
      description: task.description ?? "",
      type: task.type,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ?? "",
      dueTime: task.dueTime ?? "",
      accountId: task.accountId ?? "",
      contactId: task.contactId ?? "",
      brandId: task.brandId ?? "",
      orderId: task.orderId ?? "",
      notes: task.notes ?? "",
    }
  }
  return { ...EMPTY_TASK }
}

function TaskForm({ task, accounts, contacts, brands, orders, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(task))
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = collectErrors({
      title: required(form.title, "Title is required"),
    })
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate || "",
      dueTime: form.dueTime || "",
      accountId: form.accountId || "",
      contactId: form.contactId || "",
      brandId: form.brandId || "",
      orderId: form.orderId || "",
      notes: form.notes.trim(),
    })
  }

  return (
    <Form id="task-form" onSubmit={handleSubmit}>
      <FormField label="Title" htmlFor="title" required error={errors.title}>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Call buyer about reorder..."
        />
      </FormField>

      <FormField label="Description" htmlFor="description">
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Additional context..."
          className="min-h-[72px]"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Type" htmlFor="type">
          <Select id="type" value={form.type} onChange={(e) => setField("type", e.target.value)}>
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Priority" htmlFor="priority">
          <Select
            id="priority"
            value={form.priority}
            onChange={(e) => setField("priority", e.target.value)}
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Status" htmlFor="status">
          <Select
            id="status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Due Date" htmlFor="dueDate">
          <Input
            id="dueDate"
            type="date"
            value={form.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
          />
        </FormField>
        <FormField label="Due Time" htmlFor="dueTime">
          <Input
            id="dueTime"
            type="time"
            value={form.dueTime}
            onChange={(e) => setField("dueTime", e.target.value)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Linked Account" htmlFor="accountId">
          <Select
            id="accountId"
            value={form.accountId}
            onChange={(e) => setField("accountId", e.target.value)}
          >
            <option value="">None</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.businessName}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Linked Contact" htmlFor="contactId">
          <Select
            id="contactId"
            value={form.contactId}
            onChange={(e) => setField("contactId", e.target.value)}
          >
            <option value="">None</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Linked Brand" htmlFor="brandId">
          <Select
            id="brandId"
            value={form.brandId}
            onChange={(e) => setField("brandId", e.target.value)}
          >
            <option value="">None</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.brandName}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Linked Order" htmlFor="orderId">
          <Select
            id="orderId"
            value={form.orderId}
            onChange={(e) => setField("orderId", e.target.value)}
          >
            <option value="">None</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.orderNumber} · {o.accountName}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="Internal notes..."
          className="min-h-[72px]"
        />
      </FormField>
    </Form>
  )
}

export function TaskFormModal({
  open,
  onClose,
  onSubmit,
  task,
  initialValues,
  accounts,
  contacts,
  brands,
  orders,
}) {
  const formKey = task?.id ?? JSON.stringify(initialValues ?? "new")

  function handleSubmit(data) {
    onSubmit(data)
    onClose()
  }

  const seedTask = task ?? (initialValues ? { ...EMPTY_TASK, ...initialValues } : null)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? "Edit Task" : "Add Task"}
      description={
        task ? "Update task details and links." : "Create a task or follow-up action item."
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="task-form">
            {task ? "Save Changes" : "Create Task"}
          </Button>
        </>
      }
    >
      <TaskForm
        key={formKey}
        task={seedTask}
        accounts={accounts}
        contacts={contacts}
        brands={brands}
        orders={orders}
        onSubmit={handleSubmit}
      />
    </Modal>
  )
}
