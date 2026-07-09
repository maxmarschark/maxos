function summarizeLineItems(lineItems) {
  return (lineItems ?? []).map((item) => ({
    productName: item.productName ?? item.product_name ?? "",
    quantity: item.quantity,
    unitPrice: item.unitPrice ?? item.unit_price,
    lineTotal: item.lineTotal ?? item.line_total,
  }))
}

export function traceOrderAmount(step, data, extra = {}) {
  console.info(`[OrderSaveTrace] ${step}`, {
    orderAmount: data?.orderAmount ?? data?.order_amount,
    subtotalAmount: data?.subtotalAmount ?? data?.subtotal_amount,
    discountAmount: data?.discountAmount ?? data?.discount_amount,
    commissionAmount: data?.commissionAmount ?? data?.commission_amount,
    commissionPercent: data?.commissionPercent ?? data?.commission_percent,
    lineItemCount: data?.lineItems?.length ?? 0,
    lineItems: summarizeLineItems(data?.lineItems),
    ...extra,
  })
}
