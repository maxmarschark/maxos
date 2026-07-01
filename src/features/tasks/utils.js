import { loadFromStorage } from "../../lib/storage"
import { ACCOUNTS_STORAGE_KEY } from "../accounts/constants"
import { SEED_ACCOUNTS } from "../accounts/seed"
import { BRANDS_STORAGE_KEY } from "../brands/constants"
import { SEED_BRANDS } from "../brands/seed"
import { CONTACTS_STORAGE_KEY } from "../contacts/constants"
import { ORDERS_STORAGE_KEY } from "../orders/constants"
import { buildSeedOrders } from "../orders/seed"
import { isOverdue, isSameDay, daysBetween } from "../today/utils"
import { PRIORITY_RANK, TASK_TYPES } from "./constants"

const CONTACT_METHOD_TO_TYPE = {
  Call: "Call",
  Text: "Text",
  Email: "Email",
  Visit: "Visit",
}

export function isTaskOpen(task) {
  return task.status !== "Complete"
}

export function isTaskActionable(task) {
  return task.status !== "Complete" && task.status !== "Snoozed"
}

export function compareTaskPriority(a, b) {
  const rankDiff = (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0)
  if (rankDiff !== 0) return rankDiff
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
  if (a.dueDate) return -1
  if (b.dueDate) return 1
  return a.title.localeCompare(b.title)
}

export function enrichTask(task, { accounts, contacts, brands, orders }) {
  const account = accounts.find((a) => a.id === task.accountId)
  const contact = contacts.find((c) => c.id === task.contactId)
  const brand = brands.find((b) => b.id === task.brandId)
  const order = orders.find((o) => o.id === task.orderId)

  const linkParts = []
  if (account) linkParts.push(account.businessName)
  if (contact) linkParts.push(contact.fullName)
  if (brand) linkParts.push(brand.brandName)
  if (order) linkParts.push(`#${order.orderNumber}`)

  return {
    ...task,
    accountName: account?.businessName ?? "",
    contactName: contact?.fullName ?? "",
    brandName: brand?.brandName ?? "",
    orderNumber: order?.orderNumber ?? "",
    linkLabel: linkParts.join(" · "),
    taskLink: `/tasks`,
  }
}

export function enrichTasks(tasks, refs) {
  return tasks.map((t) => enrichTask(t, refs))
}

export function loadReferenceData() {
  return {
    accounts: loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS),
    contacts: loadFromStorage(CONTACTS_STORAGE_KEY, []),
    brands: loadFromStorage(BRANDS_STORAGE_KEY, SEED_BRANDS),
    orders: loadFromStorage(ORDERS_STORAGE_KEY, buildSeedOrders()),
  }
}

export function migrateAccountTasks(accounts) {
  const tasks = []
  accounts.forEach((account) => {
    account.tasks?.forEach((task) => {
      if (!task.title) return
      tasks.push({
        id: task.id,
        title: task.title,
        description: "",
        type: "Other",
        priority: "Medium",
        status: task.done ? "Complete" : "Open",
        dueDate: task.dueDate ?? "",
        dueTime: "",
        accountId: account.id,
        contactId: "",
        brandId: "",
        orderId: "",
        notes: "",
        createdAt: task.createdAt ?? new Date().toISOString(),
        updatedAt: task.createdAt ?? new Date().toISOString(),
        completedAt: task.done ? task.createdAt ?? new Date().toISOString() : null,
      })
    })
  })
  return tasks
}

export function buildFollowUpFromContact(contact, dueDate) {
  return {
    title: `Follow up with ${contact.fullName}`,
    description: contact.companyDisplay ? `Company: ${contact.companyDisplay}` : "",
    type: CONTACT_METHOD_TO_TYPE[contact.preferredContactMethod] ?? "Call",
    priority: "High",
    status: "Open",
    dueDate,
    dueTime: "",
    accountId: contact.accountId ?? "",
    contactId: contact.id,
    brandId: contact.brandId ?? "",
    orderId: "",
    notes: "",
  }
}

export function buildFollowUpFromAccount(account, dueDate) {
  return {
    title: `Follow up with ${account.businessName}`,
    description: account.owner ? `Owner: ${account.owner}` : "",
    type: "Visit",
    priority: "High",
    status: "Open",
    dueDate,
    dueTime: "",
    accountId: account.id,
    contactId: "",
    brandId: "",
    orderId: "",
    notes: "",
  }
}

export function matchesDueDateFilter(task, filter, todayISO) {
  if (!filter) return true
  if (filter === "no_date") return !task.dueDate
  if (!task.dueDate) return false

  if (filter === "overdue") {
    return isTaskActionable(task) && isOverdue(task.dueDate, todayISO)
  }
  if (filter === "today") {
    return isSameDay(task.dueDate, todayISO)
  }
  if (filter === "this_week") {
    const end = addDaysISO(todayISO, 7)
    return task.dueDate >= todayISO && task.dueDate <= end
  }
  if (filter === "upcoming") {
    return task.dueDate >= todayISO
  }
  return true
}

function addDaysISO(iso, days) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function filterTasks(tasks, { search, statusFilter, priorityFilter, dueDateFilter, todayISO }) {
  let result = [...tasks]

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.notes ?? "").toLowerCase().includes(q) ||
        t.accountName.toLowerCase().includes(q) ||
        t.contactName.toLowerCase().includes(q) ||
        t.brandName.toLowerCase().includes(q) ||
        t.orderNumber.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q)
    )
  }

  if (statusFilter) {
    result = result.filter((t) => t.status === statusFilter)
  }

  if (priorityFilter) {
    result = result.filter((t) => t.priority === priorityFilter)
  }

  if (dueDateFilter) {
    result = result.filter((t) => matchesDueDateFilter(t, dueDateFilter, todayISO))
  }

  return result.sort(compareTaskPriority)
}

export function buildTasksDueToday(tasks, todayISO) {
  return tasks
    .filter((t) => isTaskActionable(t) && t.dueDate && isSameDay(t.dueDate, todayISO))
    .sort(compareTaskPriority)
}

export function buildTasksOverdue(tasks, todayISO) {
  return tasks
    .filter((t) => isTaskActionable(t) && t.dueDate && isOverdue(t.dueDate, todayISO))
    .map((t) => ({
      ...t,
      daysOverdue: daysBetween(t.dueDate, todayISO),
      overdue: true,
    }))
    .sort((a, b) => compareTaskPriority(a, b) || b.daysOverdue - a.daysOverdue)
}

export function flattenTasksForToday(tasks, todayISO) {
  const overdue = buildTasksOverdue(tasks, todayISO)
  const dueToday = buildTasksDueToday(tasks, todayISO).filter(
    (t) => !overdue.some((o) => o.id === t.id)
  )
  return [...overdue, ...dueToday.map((t) => ({ ...t, overdue: false }))]
}

export function getTaskLink(task) {
  if (task.orderId) return `/orders/${task.orderId}`
  if (task.contactId) return `/contacts/${task.contactId}`
  if (task.accountId) return `/accounts/${task.accountId}`
  if (task.brandId) return `/brands/${task.brandId}`
  return "/tasks"
}

export function isAdminTask(task) {
  return task.type === "Admin" || (task.type === "Other" && !task.accountId && !task.contactId)
}

export function sortTasksByPriority(tasks) {
  return [...tasks].sort(compareTaskPriority)
}

export { TASK_TYPES }
