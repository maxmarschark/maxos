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
  orderAmount: 0,
  commissionPercent: 0,
  commissionAmount: 0,
  orderStatus: "Draft",
  paymentStatus: "Unpaid",
  paymentDueDate: null,
  notes: "",
}
