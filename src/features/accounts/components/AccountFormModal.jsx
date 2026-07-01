import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Form, FormField } from "../../../components/ui/Form"
import { Input } from "../../../components/ui/Input"
import { Select } from "../../../components/ui/Select"
import { Textarea } from "../../../components/ui/Textarea"
import { US_STATES, EMPTY_ACCOUNT } from "../constants"
import { formatDateInput } from "../../../lib/format"

function parseBrands(value) {
  return value
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean)
}

function brandsToString(brands) {
  return Array.isArray(brands) ? brands.join(", ") : ""
}

function buildInitialForm(account) {
  if (account) {
    return {
      businessName: account.businessName,
      owner: account.owner,
      phone: account.phone,
      email: account.email,
      address: account.address,
      city: account.city,
      state: account.state,
      website: account.website,
      outstandingBalance: account.outstandingBalance,
      lastVisit: formatDateInput(account.lastVisit),
      nextFollowUp: formatDateInput(account.nextFollowUp),
      brandsInput: brandsToString(account.brandsCarried),
    }
  }
  return {
    ...EMPTY_ACCOUNT,
    brandsInput: "",
    lastVisit: "",
    nextFollowUp: "",
  }
}

function AccountForm({ account, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(account))
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.businessName.trim()) {
      nextErrors.businessName = "Business name is required"
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      businessName: form.businessName.trim(),
      owner: form.owner.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state,
      website: form.website.trim(),
      brandsCarried: parseBrands(form.brandsInput),
      outstandingBalance: Number(form.outstandingBalance) || 0,
      lastVisit: form.lastVisit || null,
      nextFollowUp: form.nextFollowUp || null,
    })
  }

  return (
    <Form id="account-form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Business Name"
          htmlFor="businessName"
          required
          error={errors.businessName}
          className="sm:col-span-2"
        >
          <Input
            id="businessName"
            value={form.businessName}
            onChange={(e) => setField("businessName", e.target.value)}
            placeholder="Green Leaf Dispensary"
            error={errors.businessName}
          />
        </FormField>

        <FormField label="Owner" htmlFor="owner">
          <Input
            id="owner"
            value={form.owner}
            onChange={(e) => setField("owner", e.target.value)}
            placeholder="Marcus Chen"
          />
        </FormField>

        <FormField label="Phone" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="(512) 555-0142"
          />
        </FormField>

        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="owner@business.com"
          />
        </FormField>

        <FormField label="Website" htmlFor="website">
          <Input
            id="website"
            value={form.website}
            onChange={(e) => setField("website", e.target.value)}
            placeholder="business.com"
          />
        </FormField>

        <FormField label="Address" htmlFor="address" className="sm:col-span-2">
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            placeholder="1420 Commerce Blvd"
          />
        </FormField>

        <FormField label="City" htmlFor="city">
          <Input
            id="city"
            value={form.city}
            onChange={(e) => setField("city", e.target.value)}
            placeholder="Austin"
          />
        </FormField>

        <FormField label="State" htmlFor="state">
          <Select
            id="state"
            value={form.state}
            onChange={(e) => setField("state", e.target.value)}
          >
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Brands Carried"
          htmlFor="brandsInput"
          hint="Comma-separated"
          className="sm:col-span-2"
        >
          <Textarea
            id="brandsInput"
            value={form.brandsInput}
            onChange={(e) => setField("brandsInput", e.target.value)}
            placeholder="HempCo, Cloud Nine, Valley Hemp"
            className="min-h-[60px]"
          />
        </FormField>

        <FormField label="Outstanding Balance" htmlFor="outstandingBalance">
          <Input
            id="outstandingBalance"
            type="number"
            min="0"
            step="1"
            value={form.outstandingBalance}
            onChange={(e) => setField("outstandingBalance", e.target.value)}
          />
        </FormField>

        <FormField label="Last Visit" htmlFor="lastVisit">
          <Input
            id="lastVisit"
            type="date"
            value={form.lastVisit}
            onChange={(e) => setField("lastVisit", e.target.value)}
          />
        </FormField>

        <FormField label="Next Follow-up" htmlFor="nextFollowUp">
          <Input
            id="nextFollowUp"
            type="date"
            value={form.nextFollowUp}
            onChange={(e) => setField("nextFollowUp", e.target.value)}
          />
        </FormField>
      </div>
    </Form>
  )
}

export function AccountFormModal({ open, onClose, onSubmit, account }) {
  const isEdit = Boolean(account)

  function handleSubmit(data) {
    onSubmit(data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Account" : "Add Account"}
      description={
        isEdit
          ? "Update account details below."
          : "Add a new retailer or distributor."
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="account-form">
            {isEdit ? "Save Changes" : "Add Account"}
          </Button>
        </>
      }
    >
      {open && (
        <AccountForm
          key={account?.id ?? "new"}
          account={account}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  )
}
