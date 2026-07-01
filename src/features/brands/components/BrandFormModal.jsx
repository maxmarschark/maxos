import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Form, FormField } from "../../../components/ui/Form"
import { Input } from "../../../components/ui/Input"
import { Select } from "../../../components/ui/Select"
import { Textarea } from "../../../components/ui/Textarea"
import { EMPTY_BRAND, BRAND_STATUSES } from "../constants"

function buildInitialForm(brand) {
  if (brand) {
    return {
      brandName: brand.brandName,
      description: brand.description,
      website: brand.website,
      mainContact: brand.mainContact,
      contactEmail: brand.contactEmail,
      contactPhone: brand.contactPhone,
      commissionDefault: brand.commissionDefault,
      status: brand.status,
      notes: brand.notes,
      monthlySales: brand.monthlySales,
    }
  }
  return { ...EMPTY_BRAND, monthlySales: 0 }
}

function BrandForm({ brand, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(brand))
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.brandName.trim()) nextErrors.brandName = "Brand name is required"
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      brandName: form.brandName.trim(),
      description: form.description.trim(),
      website: form.website.trim(),
      mainContact: form.mainContact.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      commissionDefault: Number(form.commissionDefault) || 0,
      status: form.status,
      notes: form.notes.trim(),
      monthlySales: Number(form.monthlySales) || 0,
    })
  }

  return (
    <Form id="brand-form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Brand Name"
          htmlFor="brandName"
          required
          error={errors.brandName}
          className="sm:col-span-2"
        >
          <Input
            id="brandName"
            value={form.brandName}
            onChange={(e) => setField("brandName", e.target.value)}
            placeholder="MitWellness"
            error={errors.brandName}
          />
        </FormField>

        <FormField label="Description" htmlFor="description" className="sm:col-span-2">
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Brief description of the brand..."
            className="min-h-[72px]"
          />
        </FormField>

        <FormField label="Website" htmlFor="website">
          <Input
            id="website"
            value={form.website}
            onChange={(e) => setField("website", e.target.value)}
            placeholder="brand.com"
          />
        </FormField>

        <FormField label="Main Contact" htmlFor="mainContact">
          <Input
            id="mainContact"
            value={form.mainContact}
            onChange={(e) => setField("mainContact", e.target.value)}
            placeholder="Alex Rivera"
          />
        </FormField>

        <FormField label="Contact Email" htmlFor="contactEmail">
          <Input
            id="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setField("contactEmail", e.target.value)}
            placeholder="contact@brand.com"
          />
        </FormField>

        <FormField label="Contact Phone" htmlFor="contactPhone">
          <Input
            id="contactPhone"
            type="tel"
            value={form.contactPhone}
            onChange={(e) => setField("contactPhone", e.target.value)}
            placeholder="(512) 555-0100"
          />
        </FormField>

        <FormField label="Commission Default %" htmlFor="commissionDefault">
          <Input
            id="commissionDefault"
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={form.commissionDefault}
            onChange={(e) => setField("commissionDefault", e.target.value)}
          />
        </FormField>

        <FormField label="Status" htmlFor="status">
          <Select
            id="status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            {BRAND_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Monthly Sales" htmlFor="monthlySales">
          <Input
            id="monthlySales"
            type="number"
            min="0"
            step="1"
            value={form.monthlySales}
            onChange={(e) => setField("monthlySales", e.target.value)}
          />
        </FormField>

        <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="Internal notes about this brand..."
            className="min-h-[72px]"
          />
        </FormField>
      </div>
    </Form>
  )
}

export function BrandFormModal({ open, onClose, onSubmit, brand }) {
  const isEdit = Boolean(brand)

  function handleSubmit(data) {
    onSubmit(data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Brand" : "Add Brand"}
      description={isEdit ? "Update brand details below." : "Add a new brand partner."}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="brand-form">
            {isEdit ? "Save Changes" : "Add Brand"}
          </Button>
        </>
      }
    >
      {open && (
        <BrandForm
          key={brand?.id ?? "new"}
          brand={brand}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  )
}
