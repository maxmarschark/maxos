import { generateId } from "../../lib/id"
import { calcCommissionAmount } from "./utils"

export function getProductUnitPrice(product, priceType) {
  if (!product || priceType === "Custom") return 0
  switch (priceType) {
    case "Wholesale Price":
      return Number(product.wholesalePrice ?? product.wholesale_price) || 0
    case "MSRP":
      return Number(product.msrp) || 0
    case "Distributor Price":
    default:
      return Number(product.distributorPrice ?? product.distributor_price) || 0
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

export function normalizeLineItemsForSave(lineItems) {
  return (lineItems ?? []).map((item) => {
    const quantity = Number(item.quantity) || 0
    const unitPrice = Number(item.unitPrice ?? item.unit_price) || 0
    const existingLineTotal = Number(item.lineTotal ?? item.line_total) || 0
    const computedLineTotal = calcLineTotal(quantity, unitPrice)
    const lineTotal = computedLineTotal > 0 ? computedLineTotal : existingLineTotal
    const resolvedUnitPrice =
      unitPrice > 0
        ? unitPrice
        : quantity > 0 && lineTotal > 0
          ? Math.round((lineTotal / quantity) * 100) / 100
          : 0

    return {
      ...item,
      id: item.id || generateId(),
      productName: item.productName ?? item.product_name ?? "",
      sku: item.sku ?? "",
      quantity,
      unitPrice: resolvedUnitPrice,
      priceType: item.priceType ?? item.price_type ?? "Distributor Price",
      lineTotal,
    }
  })
}

/**
 * Recompute subtotal, discount, order total, and commission before persisting.
 * When line items exist, totals always derive from line_total sums.
 */
export function prepareOrderForSave(order) {
  const lineItems = normalizeLineItemsForSave(order.lineItems)
  const discountAmount = Math.max(0, Number(order.discountAmount) || 0)
  const commissionPercent = Number(order.commissionPercent) || 0

  if (lineItems.length > 0) {
    const totals = calcOrderTotals({ lineItems, discountAmount, commissionPercent })
    return {
      ...order,
      lineItems,
      ...totals,
      commissionPercent,
    }
  }

  const orderAmount = Math.max(0, Number(order.orderAmount) || 0)
  const subtotalAmount = Math.max(0, Number(order.subtotalAmount) || orderAmount)
  return {
    ...order,
    lineItems,
    subtotalAmount,
    discountAmount,
    orderAmount,
    commissionPercent,
    commissionAmount: calcCommissionAmount(orderAmount, commissionPercent),
  }
}

export function createLineItemFromProduct(product, priceType = "Distributor Price") {
  const unitPrice = getProductUnitPrice(product, priceType)
  const quantity = 1
  return {
    id: generateId(),
    productId: product.id,
    productName: product.productName ?? product.product_name ?? "",
    sku: product.sku ?? "",
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
    next.productName = product.productName ?? product.product_name ?? ""
    next.sku = product.sku ?? ""
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
