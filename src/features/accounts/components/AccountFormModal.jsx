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
      createPrimaryContact: false,
      primaryContactName: "",
      primaryContactRole: "",
      primaryContactPhone: "",
      primaryContactEmail: "",
    }
  }
  return {
    ...EMPTY_ACCOUNT,
    brandsInput: "",
    lastVisit: "",
    nextFollowUp: "",
    createPrimaryContact: false,
    primaryContactName: "",
    primaryContactRole: "",
    primaryContactPhone: "",
    primaryContactEmail: "",
  }
}

function AccountForm({ account, onSubmit }) {
  const isEdit = Boolean(account)
  const [form, setForm] = useState(() => buildInitialForm(account))
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "owner" && !prev.primaryContactName.trim()) {
        next.primaryContactName = value
      }
      return next
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.businessName.trim()) {
      nextErrors.businessName = "Business name is required"
    }
    if (
      !isEdit &&
      form.createPrimaryContact &&
      !form.primaryContactName.trim() &&
      !form.owner.trim()
    ) {
      nextErrors.primaryContactName = "Contact name is required when creating a primary contact"
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      account: {
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
      },
      primaryContact:
        !isEdit && form.createPrimaryContact
          ? {
              name: form.primaryContactName.trim() || form.owner.trim(),
              role: form.primaryContactRole.trim(),
              phone: form.primaryContactPhone.trim(),
              email: form.primaryContactEmail.trim(),
            }
          : null,
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

        {!isEdit && (
          <div className="space-y-4 border-t border-zinc-800/80 pt-4 sm:col-span-2">
            <div>
              <h3 className="text-sm font-medium text-zinc-200">Primary Contact</h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Optionally create a linked contact when this account is saved.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.createPrimaryContact}
                onChange={(e) => setField("createPrimaryContact", e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600"
              />
              Create primary contact for this account
            </label>

            {form.createPrimaryContact && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Contact Name"
                  htmlFor="primaryContactName"
                  error={errors.primaryContactName}
                >
                  <Input
                    id="primaryContactName"
                    value={form.primaryContactName}
                    onChange={(e) => setField("primaryContactName", e.target.value)}
                    placeholder="Marcus Chen"
                    error={errors.primaryContactName}
                  />
                </FormField>

                <FormField label="Contact Role" htmlFor="primaryContactRole">
                  <Input
                    id="primaryContactRole"
                    value={form.primaryContactRole}
                    onChange={(e) => setField("primaryContactRole", e.target.value)}
                    placeholder="Owner, Buyer..."
                  />
                </FormField>

                <FormField label="Contact Phone" htmlFor="primaryContactPhone">
                  <Input
                    id="primaryContactPhone"
                    type="tel"
                    value={form.primaryContactPhone}
                    onChange={(e) => setField("primaryContactPhone", e.target.value)}
                    placeholder={form.phone || "(512) 555-0142"}
                  />
                </FormField>

                <FormField label="Contact Email" htmlFor="primaryContactEmail">
                  <Input
                    id="primaryContactEmail"
                    type="email"
                    value={form.primaryContactEmail}
                    onChange={(e) => setField("primaryContactEmail", e.target.value)}
                    placeholder={form.email || "owner@business.com"}
                  />
                </FormField>
              </div>
            )}
          </div>
        )}
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
