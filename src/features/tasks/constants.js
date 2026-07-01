export const TASKS_STORAGE_KEY = "max-os-tasks"

export const TASK_TYPES = [
  "Call",
  "Text",
  "Email",
  "Visit",
  "Sample Drop",
  "Collection",
  "Order Follow-up",
  "Commission",
  "Admin",
  "Other",
]

export const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"]

export const TASK_STATUSES = ["Open", "In Progress", "Complete", "Snoozed"]

export const PRIORITY_RANK = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

export const PRIORITY_VARIANTS = {
  Urgent: "danger",
  High: "warning",
  Medium: "primary",
  Low: "default",
}

export const STATUS_VARIANTS = {
  Open: "default",
  "In Progress": "primary",
  Complete: "success",
  Snoozed: "warning",
}

export const DUE_DATE_FILTERS = [
  { value: "", label: "All Dates" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due Today" },
  { value: "this_week", label: "This Week" },
  { value: "upcoming", label: "Upcoming" },
  { value: "no_date", label: "No Date" },
]

export const EMPTY_TASK = {
  title: "",
  description: "",
  type: "Other",
  priority: "Medium",
  status: "Open",
  dueDate: "",
  dueTime: "",
  accountId: "",
  contactId: "",
  brandId: "",
  orderId: "",
  notes: "",
}
