import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
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
  PRICE_TYPES,
} from "../constants"
import {
  buildProductsNotes,
  calcOrderTotals,
  createLineItemFromProduct,
  generateOrderNumber,
  updateLineItem,
} from "../orderBuilder"
import { formatCurrencyDetailed } from "../../../lib/format"

function buildInitialForm(order) {
  if (order) {
    return {
      orderNumber: order.orderNumber,
      accountId: order.accountId,
      brandId: order.brandId,
      orderDate: order.orderDate,
      lineItems: order.lineItems ?? [],
      discountAmount: order.discountAmount ?? 0,
      commissionPercent: order.commissionPercent,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentDueDate: order.paymentDueDate ?? "",
      notes: order.notes,
    }
  }
  return {
    ...EMPTY_ORDER,
    orderNumber: generateOrderNumber(),
    orderDate: new Date().toISOString().slice(0, 10),
    lineItems: [],
  }
}

function OrderBuilderForm({ order, accounts, brands, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(order))
  const [commissionManual, setCommissionManual] = useState(Boolean(order))
  const [errors, setErrors] = useState({})
  const [productToAdd, setProductToAdd] = useState("")

  const selectedBrand = useMemo(
    () => brands.find((b) => b.id === form.brandId),
    [brands, form.brandId]
  )

  const brandProducts = selectedBrand?.products ?? []

  const totals = useMemo(
    () =>
      calcOrderTotals({
        lineItems: form.lineItems,
        discountAmount: form.discountAmount,
        commissionPercent: form.commissionPercent,
      }),
    [form.lineItems, form.discountAmount, form.commissionPercent]
  )

  function setField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === "brandId") {
        if (prev.brandId !== value) {
          next.lineItems = []
          setProductToAdd("")
        }
        if (!commissionManual) {
          const brand = brands.find((b) => b.id === value)
          if (brand) next.commissionPercent = brand.commissionDefault
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

  function handleAddProduct() {
    const product = brandProducts.find((p) => p.id === productToAdd)
    if (!product) return
    setForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, createLineItemFromProduct(product)],
    }))
    setProductToAdd("")
    if (errors.lineItems) setErrors((prev) => ({ ...prev, lineItems: undefined }))
  }

  function handleLineItemChange(index, changes) {
    setForm((prev) => {
      const items = [...prev.lineItems]
      const product = brandProducts.find(
        (p) => p.id === (changes.productId ?? items[index].productId)
      )
      items[index] = updateLineItem(items[index], changes, product)
      return { ...prev, lineItems: items }
    })
  }

  function handleRemoveLineItem(index) {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.orderNumber.trim()) nextErrors.orderNumber = "Order number is required"
    if (!form.accountId) nextErrors.accountId = "Account is required"
    if (!form.brandId) nextErrors.brandId = "Brand is required"
    if (!form.orderDate) nextErrors.orderDate = "Order date is required"
    if (!form.lineItems.length && !order) nextErrors.lineItems = "Add at least one product"
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const hasLineItems = form.lineItems.length > 0
    const payload = {
      orderNumber: form.orderNumber.trim(),
      accountId: form.accountId,
      brandId: form.brandId,
      orderDate: form.orderDate,
      lineItems: form.lineItems,
      productsNotes: hasLineItems
        ? buildProductsNotes(form.lineItems)
        : order?.productsNotes ?? "",
      subtotalAmount: hasLineItems ? totals.subtotalAmount : order?.subtotalAmount ?? order?.orderAmount ?? 0,
      discountAmount: hasLineItems ? totals.discountAmount : order?.discountAmount ?? 0,
      orderAmount: hasLineItems ? totals.orderAmount : order?.orderAmount ?? 0,
      commissionPercent: Number(form.commissionPercent) || 0,
      commissionAmount: hasLineItems
        ? totals.commissionAmount
        : Math.round((Number(order?.orderAmount) || 0) * (Number(form.commissionPercent) || 0) / 100 * 100) / 100,
      orderStatus: form.orderStatus,
      paymentStatus: form.paymentStatus,
      paymentDueDate: form.paymentDueDate || null,
      notes: form.notes.trim(),
    }

    onSubmit(payload)
  }

  return (
    <Form id="order-builder-form" onSubmit={handleSubmit}>
      <div className="space-y-6">
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
              placeholder="ORD-20250630-1234"
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
            label="Account / Customer"
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
        </div>

        {form.brandId && (
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <FormField label="Add Product" htmlFor="productToAdd" className="flex-1">
                <Select
                  id="productToAdd"
                  value={productToAdd}
                  onChange={(e) => setProductToAdd(e.target.value)}
                >
                  <option value="">
                    {brandProducts.length
                      ? "Select a product..."
                      : "No products saved for this brand"}
                  </option>
                  {brandProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productName}
                      {p.sku ? ` (${p.sku})` : ""}
                    </option>
                  ))}
                </Select>
              </FormField>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={handleAddProduct}
                disabled={!productToAdd}
                className="mb-0.5"
              >
                Add
              </Button>
            </div>

            {errors.lineItems && (
              <p className="text-sm text-red-400">{errors.lineItems}</p>
            )}

            {form.lineItems.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">SKU</th>
                      <th className="w-20 px-3 py-2 font-medium">Qty</th>
                      <th className="w-36 px-3 py-2 font-medium">Price Type</th>
                      <th className="w-28 px-3 py-2 font-medium">Unit Price</th>
                      <th className="w-28 px-3 py-2 text-right font-medium">Line Total</th>
                      <th className="w-10 px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {form.lineItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-zinc-200">{item.productName}</td>
                        <td className="px-3 py-2 text-zinc-400">{item.sku || "—"}</td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleLineItemChange(index, { quantity: e.target.value })
                            }
                            className="h-8"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Select
                            value={item.priceType}
                            onChange={(e) =>
                              handleLineItemChange(index, { priceType: e.target.value })
                            }
                            className="h-8 text-xs"
                          >
                            {PRICE_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            disabled={item.priceType !== "Custom"}
                            onChange={(e) =>
                              handleLineItemChange(index, { unitPrice: e.target.value })
                            }
                            className="h-8"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-zinc-200">
                          {formatCurrencyDetailed(item.lineTotal)}
                        </td>
                        <td className="px-2 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            icon={Trash2}
                            onClick={() => handleRemoveLineItem(index)}
                            aria-label="Remove line item"
                            className="h-8 w-8 text-zinc-500 hover:text-red-400"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="text-sm font-medium text-zinc-300">Totals & Commission</h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200">
                  {formatCurrencyDetailed(totals.subtotalAmount)}
                </span>
              </div>
              <FormField label="Discount" htmlFor="discountAmount">
                <Input
                  id="discountAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountAmount}
                  onChange={(e) => setField("discountAmount", e.target.value)}
                  placeholder="0.00"
                />
              </FormField>
              <div className="flex justify-between border-t border-zinc-800 pt-2 font-medium text-zinc-100">
                <span>Order Total</span>
                <span>{formatCurrencyDetailed(totals.orderAmount)}</span>
              </div>
            </div>

            <div className="space-y-3">
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
              <div className="rounded-md border border-emerald-900/50 bg-emerald-950/30 px-3 py-2">
                <p className="text-xs text-emerald-600">Estimated Commission</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {formatCurrencyDetailed(totals.commissionAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <FormField label="Internal Notes" htmlFor="notes">
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="Optional notes..."
            className="min-h-[64px]"
          />
        </FormField>
      </div>
    </Form>
  )
}

export function OrderBuilderModal({ open, onClose, onSubmit, order, accounts, brands }) {
  const formKey = order?.id ?? "new"

  function handleSubmit(data) {
    onSubmit(data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={order ? `Edit Order #${order.orderNumber}` : "New Order"}
      description={
        order
          ? "Update line items, totals, and commission."
          : "Select account and brand, add products, and review commission before saving."
      }
      className="max-w-4xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="order-builder-form">
            {order ? "Save Changes" : "Create Order"}
          </Button>
        </>
      }
    >
      <OrderBuilderForm
        key={formKey}
        order={order}
        accounts={accounts}
        brands={brands}
        onSubmit={handleSubmit}
      />
    </Modal>
  )
}
