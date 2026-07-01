import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Form, FormField } from "../../../components/ui/Form"
import { Input } from "../../../components/ui/Input"
import { Select } from "../../../components/ui/Select"
import { Textarea } from "../../../components/ui/Textarea"
import {
  EMPTY_CONTACT,
  CONTACT_TYPES,
  PREFERRED_CONTACT_METHODS,
} from "../constants"
import { US_STATES } from "../../accounts/constants"

function buildInitialForm(contact) {
  if (contact) {
    return {
      firstName: contact.firstName,
      lastName: contact.lastName,
      accountId: contact.accountId ?? "",
      brandId: contact.brandId ?? "",
      company: contact.company,
      role: contact.role,
      type: contact.type,
      phone: contact.phone,
      email: contact.email,
      preferredContactMethod: contact.preferredContactMethod,
      city: contact.city,
      state: contact.state,
      notes: contact.notes,
      lastContactDate: contact.lastContactDate ?? "",
      nextFollowUpDate: contact.nextFollowUpDate ?? "",
    }
  }
  return { ...EMPTY_CONTACT, state: "TX" }
}

function ContactForm({ contact, accounts, brands, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(contact))
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "accountId" && value) {
        const account = accounts.find((a) => a.id === value)
        if (account) {
          next.company = ""
          if (!next.city) next.city = account.city
          if (!next.state || next.state === "TX") next.state = account.state
        }
      }
      return next
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.firstName.trim() && !form.lastName.trim()) {
      nextErrors.firstName = "First or last name is required"
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      accountId: form.accountId || "",
      brandId: form.brandId || "",
      company: form.accountId ? "" : form.company.trim(),
      role: form.role.trim(),
      type: form.type,
      phone: form.phone.trim(),
      email: form.email.trim(),
      preferredContactMethod: form.preferredContactMethod,
      city: form.city.trim(),
      state: form.state,
      notes: form.notes.trim(),
      lastContactDate: form.lastContactDate || null,
      nextFollowUpDate: form.nextFollowUpDate || null,
    })
  }

  return (
    <Form id="contact-form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="First Name"
          htmlFor="firstName"
          error={errors.firstName}
        >
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            placeholder="Marcus"
            error={errors.firstName}
          />
        </FormField>

        <FormField label="Last Name" htmlFor="lastName">
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            placeholder="Chen"
          />
        </FormField>

        <FormField label="Account" htmlFor="accountId">
          <Select
            id="accountId"
            value={form.accountId}
            onChange={(e) => setField("accountId", e.target.value)}
          >
            <option value="">None — use company below</option>
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
            <option value="">None</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.brandName}
              </option>
            ))}
          </Select>
        </FormField>

        {!form.accountId && (
          <FormField label="Company" htmlFor="company" className="sm:col-span-2">
            <Input
              id="company"
              value={form.company}
              onChange={(e) => setField("company", e.target.value)}
              placeholder="Company name if not linked to account"
            />
          </FormField>
        )}

        <FormField label="Role / Title" htmlFor="role">
          <Input
            id="role"
            value={form.role}
            onChange={(e) => setField("role", e.target.value)}
            placeholder="Owner, Buyer, Rep..."
          />
        </FormField>

        <FormField label="Type" htmlFor="type">
          <Select
            id="type"
            value={form.type}
            onChange={(e) => setField("type", e.target.value)}
          >
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
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
            placeholder="name@company.com"
          />
        </FormField>

        <FormField label="Preferred Contact Method" htmlFor="preferredContactMethod">
          <Select
            id="preferredContactMethod"
            value={form.preferredContactMethod}
            onChange={(e) => setField("preferredContactMethod", e.target.value)}
          >
            {PREFERRED_CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
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

        <FormField label="Last Contact Date" htmlFor="lastContactDate">
          <Input
            id="lastContactDate"
            type="date"
            value={form.lastContactDate}
            onChange={(e) => setField("lastContactDate", e.target.value)}
          />
        </FormField>

        <FormField label="Next Follow-up Date" htmlFor="nextFollowUpDate">
          <Input
            id="nextFollowUpDate"
            type="date"
            value={form.nextFollowUpDate}
            onChange={(e) => setField("nextFollowUpDate", e.target.value)}
          />
        </FormField>

        <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="Relationship notes, preferences..."
            className="min-h-[72px]"
          />
        </FormField>
      </div>
    </Form>
  )
}

export function ContactFormModal({
  open,
  onClose,
  onSubmit,
  contact,
  accounts,
  brands,
}) {
  const formKey = contact?.id ?? "new"

  function handleSubmit(data) {
    onSubmit(data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? `Edit ${contact.fullName}` : "Add Contact"}
      description={
        contact
          ? "Update contact details and follow-up info."
          : "Add a buyer, owner, rep, or brand contact."
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="contact-form">
            {contact ? "Save Changes" : "Create Contact"}
          </Button>
        </>
      }
    >
      <ContactForm
        key={formKey}
        contact={contact}
        accounts={accounts}
        brands={brands}
        onSubmit={handleSubmit}
      />
    </Modal>
  )
}
