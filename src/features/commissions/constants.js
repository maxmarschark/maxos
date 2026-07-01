export const COMMISSIONS_STORAGE_KEY = "max-os-commissions"

export const COMMISSION_STATUSES = [
  "Pending",
  "Invoiced",
  "Paid",
  "Disputed",
  "Written Off",
]

export const STATUS_VARIANTS = {
  Pending: "warning",
  Invoiced: "primary",
  Paid: "success",
  Disputed: "danger",
  "Written Off": "default",
}

export const EMPTY_COMMISSION_META = {
  status: "Pending",
  dueDate: null,
  paidDate: null,
  amountManual: false,
  amountOverride: null,
  notes: "",
}
