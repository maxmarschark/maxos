import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Form, FormField } from "../../../components/ui/Form"
import { Input } from "../../../components/ui/Input"
import { Select } from "../../../components/ui/Select"
import { Textarea } from "../../../components/ui/Textarea"
import { COMMISSION_STATUSES } from "../constants"
import { formatCurrency, formatCurrencyDetailed, formatPercent } from "../../../lib/format"

function buildInitialForm(commission) {
  return {
    status: commission.status,
    dueDate: commission.dueDate ?? "",
    paidDate: commission.paidDate ?? "",
    amountManual: commission.amountManual,
    amountOverride: commission.amountOverride ?? commission.commissionAmount,
    notes: commission.notes ?? "",
  }
}

function CommissionForm({ commission, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(commission))
  const [useOverride, setUseOverride] = useState(commission.amountManual)

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      status: form.status,
      dueDate: form.dueDate || null,
      paidDate: form.paidDate || null,
      amountManual: useOverride,
      amountOverride: useOverride ? Number(form.amountOverride) || 0 : null,
      notes: form.notes.trim(),
    })
  }

  return (
    <Form id="commission-form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Status" htmlFor="status">
          <Select
            id="status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            {COMMISSION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Calculated Amount">
          <div className="flex h-9 items-center rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-400">
            {formatCurrencyDetailed(commission.calculatedAmount)}
            <span className="ml-2 text-xs text-zinc-600">
              ({formatCurrency(commission.orderAmount)} × {formatPercent(commission.commissionPercent)})
            </span>
          </div>
        </FormField>

        <FormField label="Due Date" htmlFor="dueDate">
          <Input
            id="dueDate"
            type="date"
            value={form.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
          />
        </FormField>

        <FormField label="Paid Date" htmlFor="paidDate">
          <Input
            id="paidDate"
            type="date"
            value={form.paidDate}
            onChange={(e) => setField("paidDate", e.target.value)}
          />
        </FormField>

        <FormField label="Manual Override" htmlFor="amountOverride" className="sm:col-span-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={useOverride}
                onChange={(e) => setUseOverride(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-indigo-500"
              />
              Override calculated commission amount
            </label>
            {useOverride && (
              <Input
                id="amountOverride"
                type="number"
                min="0"
                step="0.01"
                value={form.amountOverride}
                onChange={(e) => setField("amountOverride", e.target.value)}
              />
            )}
          </div>
        </FormField>

        <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="Reconciliation notes..."
            className="min-h-[72px]"
          />
        </FormField>
      </div>
    </Form>
  )
}

export function CommissionFormModal({ open, onClose, onSubmit, commission }) {
  if (!commission) return null

  function handleSubmit(data) {
    onSubmit(data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Commission — Order #${commission.orderNumber}`}
      description={`${commission.accountName} · ${commission.brandName}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="commission-form">
            Save Changes
          </Button>
        </>
      }
    >
      <CommissionForm key={commission.orderId} commission={commission} onSubmit={handleSubmit} />
    </Modal>
  )
}
