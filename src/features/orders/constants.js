export const ORDERS_STORAGE_KEY = "max-os-orders"

export const ORDER_STATUSES = [
  "Draft",
  "Sent",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
]

export const PAYMENT_STATUSES = ["Unpaid", "Partially Paid", "Paid"]

export const PRICE_TYPES = [
  "Distributor Price",
  "Wholesale Price",
  "MSRP",
  "Custom",
]

export const ORDER_STATUS_VARIANTS = {
  Draft: "default",
  Sent: "primary",
  Confirmed: "primary",
  Shipped: "warning",
  Delivered: "success",
  Cancelled: "danger",
}

export const PAYMENT_STATUS_VARIANTS = {
  Unpaid: "danger",
  "Partially Paid": "warning",
  Paid: "success",
}

export const SORT_FIELDS = {
  orderNumber: "Order #",
  orderDate: "Order Date",
  orderAmount: "Amount",
  commissionPercent: "Commission %",
  orderStatus: "Status",
}

export const EMPTY_ORDER = {
  orderNumber: "",
  accountId: "",
  brandId: "",
  orderDate: new Date().toISOString().slice(0, 10),
  productsNotes: "",
  lineItems: [],
  subtotalAmount: 0,
  discountAmount: 0,
  orderAmount: 0,
  commissionPercent: 0,
  commissionAmount: 0,
  orderStatus: "Draft",
  paymentStatus: "Unpaid",
  paymentDueDate: null,
  notes: "",
}

export const EMPTY_LINE_ITEM = {
  productId: "",
  productName: "",
  sku: "",
  quantity: 1,
  unitPrice: 0,
  priceType: "Distributor Price",
  lineTotal: 0,
}
