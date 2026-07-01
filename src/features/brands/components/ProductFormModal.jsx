import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Form, FormField } from "../../../components/ui/Form"
import { Input } from "../../../components/ui/Input"
import { Select } from "../../../components/ui/Select"
import { Textarea } from "../../../components/ui/Textarea"
import { EMPTY_PRODUCT, PRODUCT_CATEGORIES } from "../constants"

function buildInitialForm(product) {
  if (product) {
    return {
      productName: product.productName,
      sku: product.sku,
      category: product.category,
      distributorPrice: product.distributorPrice,
      wholesalePrice: product.wholesalePrice,
      msrp: product.msrp,
      commissionOverride: product.commissionOverride ?? "",
      notes: product.notes,
    }
  }
  return { ...EMPTY_PRODUCT, commissionOverride: "" }
}

function ProductForm({ product, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(product))
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.productName.trim()) nextErrors.productName = "Product name is required"
    if (!form.sku.trim()) nextErrors.sku = "SKU is required"
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      productName: form.productName.trim(),
      sku: form.sku.trim(),
      category: form.category,
      distributorPrice: Number(form.distributorPrice) || 0,
      wholesalePrice: Number(form.wholesalePrice) || 0,
      msrp: Number(form.msrp) || 0,
      commissionOverride: form.commissionOverride === "" ? null : Number(form.commissionOverride),
      notes: form.notes.trim(),
    })
  }

  return (
    <Form id="product-form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Product Name"
          htmlFor="productName"
          required
          error={errors.productName}
          className="sm:col-span-2"
        >
          <Input
            id="productName"
            value={form.productName}
            onChange={(e) => setField("productName", e.target.value)}
            error={errors.productName}
          />
        </FormField>

        <FormField label="SKU" htmlFor="sku" required error={errors.sku}>
          <Input
            id="sku"
            value={form.sku}
            onChange={(e) => setField("sku", e.target.value)}
            error={errors.sku}
          />
        </FormField>

        <FormField label="Category" htmlFor="category">
          <Select
            id="category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
          >
            <option value="">Select category</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Distributor Price" htmlFor="distributorPrice">
          <Input
            id="distributorPrice"
            type="number"
            min="0"
            step="0.01"
            value={form.distributorPrice}
            onChange={(e) => setField("distributorPrice", e.target.value)}
          />
        </FormField>

        <FormField label="Wholesale Price" htmlFor="wholesalePrice">
          <Input
            id="wholesalePrice"
            type="number"
            min="0"
            step="0.01"
            value={form.wholesalePrice}
            onChange={(e) => setField("wholesalePrice", e.target.value)}
          />
        </FormField>

        <FormField label="MSRP" htmlFor="msrp">
          <Input
            id="msrp"
            type="number"
            min="0"
            step="0.01"
            value={form.msrp}
            onChange={(e) => setField("msrp", e.target.value)}
          />
        </FormField>

        <FormField label="Commission Override %" htmlFor="commissionOverride" hint="Leave blank to use brand default">
          <Input
            id="commissionOverride"
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={form.commissionOverride}
            onChange={(e) => setField("commissionOverride", e.target.value)}
            placeholder="Optional"
          />
        </FormField>

        <FormField label="Notes" htmlFor="productNotes" className="sm:col-span-2">
          <Textarea
            id="productNotes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="min-h-[60px]"
          />
        </FormField>
      </div>
    </Form>
  )
}

export function ProductFormModal({ open, onClose, onSubmit, product }) {
  const isEdit = Boolean(product)

  function handleSubmit(data) {
    onSubmit(data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Product" : "Add Product"}
      description={isEdit ? "Update product details." : "Add a product to this brand's catalog."}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form">
            {isEdit ? "Save Changes" : "Add Product"}
          </Button>
        </>
      }
    >
      {open && (
        <ProductForm
          key={product?.id ?? "new"}
          product={product}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  )
}
