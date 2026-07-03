import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Form, FormField } from "../../../components/ui/Form"
import { Input } from "../../../components/ui/Input"
import { Select } from "../../../components/ui/Select"
import { Textarea } from "../../../components/ui/Textarea"
import { EMPTY_DEAL, DEAL_STAGES } from "../constants"

function buildInitialForm(deal) {
  if (deal) {
    return {
      title: deal.title,
      accountId: deal.accountId ?? "",
      brandId: deal.brandId ?? "",
      stage: deal.stage,
      value: deal.value,
      notes: deal.notes ?? "",
    }
  }
  return { ...EMPTY_DEAL }
}

function DealForm({ deal, accounts, brands, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(deal))
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = "Title is required"
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      title: form.title.trim(),
      accountId: form.accountId || "",
      brandId: form.brandId || "",
      stage: form.stage,
      value: Number(form.value) || 0,
      notes: form.notes.trim(),
    })
  }

  return (
    <Form id="deal-form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Title"
          htmlFor="title"
          required
          error={errors.title}
          className="sm:col-span-2"
        >
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Q3 reorder — Green Leaf"
            error={errors.title}
          />
        </FormField>

        <FormField label="Account" htmlFor="accountId">
          <Select
            id="accountId"
            value={form.accountId}
            onChange={(e) => setField("accountId", e.target.value)}
          >
            <option value="">No account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.businessName}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Brand" htmlFor="brandId">
          <Select
            id="brandId"
            value={form.brandId}
            onChange={(e) => setField("brandId", e.target.value)}
          >
            <option value="">No brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.brandName}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Stage" htmlFor="stage">
          <Select
            id="stage"
            value={form.stage}
            onChange={(e) => setField("stage", e.target.value)}
          >
            {DEAL_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Value" htmlFor="value">
          <Input
            id="value"
            type="number"
            min="0"
            step="1"
            value={form.value}
            onChange={(e) => setField("value", e.target.value)}
          />
        </FormField>

        <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="Negotiation details, next steps..."
            className="min-h-[72px]"
          />
        </FormField>
      </div>
    </Form>
  )
}

export function DealFormModal({ open, onClose, onSubmit, deal, accounts, brands }) {
  const isEdit = Boolean(deal)

  function handleSubmit(data) {
    onSubmit(data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Deal" : "Add Deal"}
      description={
        isEdit ? "Update deal details below." : "Track a new pipeline opportunity."
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="deal-form">
            {isEdit ? "Save Changes" : "Add Deal"}
          </Button>
        </>
      }
    >
      {open && (
        <DealForm
          key={deal?.id ?? "new"}
          deal={deal}
          accounts={accounts}
          brands={brands}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  )
}
