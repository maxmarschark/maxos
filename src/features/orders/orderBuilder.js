import { generateId } from "../../lib/id"
import { calcCommissionAmount } from "./utils"

export function getProductUnitPrice(product, priceType) {
  if (!product || priceType === "Custom") return 0
  switch (priceType) {
    case "Wholesale Price":
      return Number(product.wholesalePrice) || 0
    case "MSRP":
      return Number(product.msrp) || 0
    case "Distributor Price":
    default:
      return Number(product.distributorPrice) || 0
  }
}

export function calcLineTotal(quantity, unitPrice) {
  const qty = Number(quantity) || 0
  const price = Number(unitPrice) || 0
  return Math.round(qty * price * 100) / 100
}

export function calcSubtotal(lineItems) {
  return (lineItems ?? []).reduce(
    (sum, item) => sum + (Number(item.lineTotal) || 0),
    0
  )
}

export function calcOrderTotals({ lineItems, discountAmount, commissionPercent }) {
  const subtotal = Math.round(calcSubtotal(lineItems) * 100) / 100
  const discount = Math.max(0, Number(discountAmount) || 0)
  const orderAmount = Math.max(0, Math.round((subtotal - discount) * 100) / 100)
  const commissionAmount = calcCommissionAmount(orderAmount, commissionPercent)
  return {
    subtotalAmount: subtotal,
    discountAmount: discount,
    orderAmount,
    commissionAmount,
  }
}

export function createLineItemFromProduct(product, priceType = "Distributor Price") {
  const unitPrice = getProductUnitPrice(product, priceType)
  const quantity = 1
  return {
    id: generateId(),
    productId: product.id,
    productName: product.productName,
    sku: product.sku,
    quantity,
    unitPrice,
    priceType,
    lineTotal: calcLineTotal(quantity, unitPrice),
  }
}

export function updateLineItem(lineItem, changes, product) {
  const next = { ...lineItem, ...changes }

  if (changes.priceType && changes.priceType !== "Custom" && product) {
    next.unitPrice = getProductUnitPrice(product, changes.priceType)
  }

  if (changes.productId && product) {
    next.productName = product.productName
    next.sku = product.sku
    if (next.priceType !== "Custom") {
      next.unitPrice = getProductUnitPrice(product, next.priceType)
    }
  }

  next.lineTotal = calcLineTotal(next.quantity, next.unitPrice)
  return next
}

export function buildProductsNotes(lineItems) {
  if (!lineItems?.length) return ""
  return lineItems
    .map((item) => `${item.productName || "Item"} ×${item.quantity}`)
    .join(", ")
}

export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `ORD-${date}-${rand}`
}
