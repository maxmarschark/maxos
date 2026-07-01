import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Form, FormField } from "../../../components/ui/Form"
import { Input } from "../../../components/ui/Input"
import { Select } from "../../../components/ui/Select"
import { Textarea } from "../../../components/ui/Textarea"
import {
  EMPTY_ORDER,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../constants"
import { calcCommissionAmount } from "../utils"
import { formatCurrencyDetailed } from "../../../lib/format"

function buildInitialForm(order) {
  if (order) {
    return {
      orderNumber: order.orderNumber,
      accountId: order.accountId,
      brandId: order.brandId,
      orderDate: order.orderDate,
      productsNotes: order.productsNotes,
      orderAmount: order.orderAmount,
      commissionPercent: order.commissionPercent,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentDueDate: order.paymentDueDate ?? "",
      notes: order.notes,
    }
  }
  return { ...EMPTY_ORDER, orderDate: new Date().toISOString().slice(0, 10) }
}

function OrderForm({ order, accounts, brands, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(order))
  const [commissionManual, setCommissionManual] = useState(false)
  const [errors, setErrors] = useState({})

  const commissionAmount = calcCommissionAmount(form.orderAmount, form.commissionPercent)

  function setField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === "brandId" && !commissionManual) {
        const brand = brands.find((b) => b.id === value)
        if (brand) {
          next.commissionPercent = brand.commissionDefault
        }
      }

      return next
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleCommissionChange(value) {
    setCommissionManual(true)
    setField("commissionPercent", value)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.orderNumber.trim()) nextErrors.orderNumber = "Order number is required"
    if (!form.accountId) nextErrors.accountId = "Account is required"
    if (!form.brandId) nextErrors.brandId = "Brand is required"
    if (!form.orderDate) nextErrors.orderDate = "Order date is required"
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      orderNumber: form.orderNumber.trim(),
      accountId: form.accountId,
      brandId: form.brandId,
      orderDate: form.orderDate,
      productsNotes: form.productsNotes.trim(),
      orderAmount: Number(form.orderAmount) || 0,
      commissionPercent: Number(form.commissionPercent) || 0,
      orderStatus: form.orderStatus,
      paymentStatus: form.paymentStatus,
      paymentDueDate: form.paymentDueDate || null,
      notes: form.notes.trim(),
    })
  }

  return (
    <Form id="order-form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Order #"
          htmlFor="orderNumber"
          required
          error={errors.orderNumber}
        >
          <Input
            id="orderNumber"
            value={form.orderNumber}
            onChange={(e) => setField("orderNumber", e.target.value)}
            placeholder="1042"
            error={errors.orderNumber}
          />
        </FormField>

        <FormField
          label="Order Date"
          htmlFor="orderDate"
          required
          error={errors.orderDate}
        >
          <Input
            id="orderDate"
            type="date"
            value={form.orderDate}
            onChange={(e) => setField("orderDate", e.target.value)}
            error={errors.orderDate}
          />
        </FormField>

        <FormField
          label="Account"
          htmlFor="accountId"
          required
          error={errors.accountId}
        >
          <Select
            id="accountId"
            value={form.accountId}
            onChange={(e) => setField("accountId", e.target.value)}
          >
            <option value="">Select account...</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.businessName}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Brand" htmlFor="brandId" required error={errors.brandId}>
          <Select
            id="brandId"
            value={form.brandId}
            onChange={(e) => setField("brandId", e.target.value)}
          >
            <option value="">Select brand...</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.brandName}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Products / Notes"
          htmlFor="productsNotes"
          className="sm:col-span-2"
        >
          <Textarea
            id="productsNotes"
            value={form.productsNotes}
            onChange={(e) => setField("productsNotes", e.target.value)}
            placeholder="Line items, SKUs, quantities..."
            className="min-h-[72px]"
          />
        </FormField>

        <FormField label="Order Amount" htmlFor="orderAmount">
          <Input
            id="orderAmount"
            type="number"
            min="0"
            step="0.01"
            value={form.orderAmount}
            onChange={(e) => setField("orderAmount", e.target.value)}
            placeholder="0.00"
          />
        </FormField>

        <FormField label="Commission %" htmlFor="commissionPercent">
          <Input
            id="commissionPercent"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.commissionPercent}
            onChange={(e) => handleCommissionChange(e.target.value)}
            placeholder="0"
          />
        </FormField>

        <FormField label="Commission $" htmlFor="commissionAmount" className="sm:col-span-2">
          <div className="flex h-9 items-center rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-300">
            {formatCurrencyDetailed(commissionAmount)}
            <span className="ml-2 text-xs text-zinc-600">Auto-calculated</span>
          </div>
        </FormField>

        <FormField label="Order Status" htmlFor="orderStatus">
          <Select
            id="orderStatus"
            value={form.orderStatus}
            onChange={(e) => setField("orderStatus", e.target.value)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Payment Status" htmlFor="paymentStatus">
          <Select
            id="paymentStatus"
            value={form.paymentStatus}
            onChange={(e) => setField("paymentStatus", e.target.value)}
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Payment Due Date" htmlFor="paymentDueDate">
          <Input
            id="paymentDueDate"
            type="date"
            value={form.paymentDueDate}
            onChange={(e) => setField("paymentDueDate", e.target.value)}
          />
        </FormField>

        <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="Internal notes..."
            className="min-h-[72px]"
          />
        </FormField>
      </div>
    </Form>
  )
}

export function OrderFormModal({ open, onClose, onSubmit, order, accounts, brands }) {
  const formKey = order?.id ?? "new"

  function handleSubmit(data) {
    onSubmit(data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={order ? `Edit Order #${order.orderNumber}` : "Add Order"}
      description={
        order
          ? "Update order details and commission."
          : "Create a new purchase order linked to an account and brand."
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="order-form">
            {order ? "Save Changes" : "Create Order"}
          </Button>
        </>
      }
    >
      <OrderForm
        key={formKey}
        order={order}
        accounts={accounts}
        brands={brands}
        onSubmit={handleSubmit}
      />
    </Modal>
  )
}
