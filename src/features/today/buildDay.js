import { formatCurrency } from "../../lib/format"
import { daysBetween, isOverdue, isSameDay, orderBalanceDue } from "./utils"
import {
  isTaskActionable,
  isAdminTask,
  getTaskLink,
} from "../tasks/utils"
import { PRIORITY_RANK } from "../tasks/constants"
import { timeToMinutes } from "../calendar/utils"
import {
  buildTodayAgenda,
  agendaItemToBuildAction,
  flexibleAgendaItemToBuildAction,
} from "./agenda"

export function buildMyDay({
  orders,
  contacts,
  accounts,
  commissions,
  tasks,
  calendarEvents = [],
  todayISO,
}) {
  const actions = []
  const agenda = buildTodayAgenda({ calendarEvents, tasks, todayISO })
  const agendaTaskIds = agenda.taskIds

  agenda.timed.forEach((item) => {
    actions.push(agendaItemToBuildAction(item))
  })

  const busyBlocks = agenda.timed
    .filter((item) => item.kind === "calendar" && item.event.eventTime)
    .map((item) => item.event)

  tasks
    .filter((t) => isTaskActionable(t) && t.priority === "Urgent" && t.dueDate && isOverdue(t.dueDate, todayISO))
    .forEach((task) => {
      if (agendaTaskIds.has(task.id)) return
      if (taskConflictsWithCalendar(task, busyBlocks)) return
      actions.push({
        priority: 1,
        sort: daysBetween(task.dueDate, todayISO) * 10 + (PRIORITY_RANK[task.priority] ?? 0),
        label: task.title,
        detail: formatTaskDetail(task),
        link: getTaskLink(task),
        taskId: task.id,
      })
    })

  orders
    .filter((o) => o.orderStatus !== "Cancelled" && orderBalanceDue(o) > 0)
    .forEach((order) => {
      const due = order.paymentDueDate
      if (due && isOverdue(due, todayISO)) {
        actions.push({
          priority: 2,
          sort: daysBetween(due, todayISO),
          label: `Collect payment from ${order.accountName}`,
          detail: `#${order.orderNumber} · ${formatCurrency(orderBalanceDue(order))} · ${daysBetween(due, todayISO)} days overdue`,
          link: `/orders/${order.id}`,
        })
      }
    })

  agenda.flexible.forEach((item) => {
    actions.push(flexibleAgendaItemToBuildAction(item))
  })

  tasks
    .filter((t) => {
      if (agendaTaskIds.has(t.id)) return false
      if (!isTaskActionable(t) || !t.dueDate) return false
      const highPriority = t.priority === "High" || t.priority === "Urgent"
      const dueRelevant =
        isOverdue(t.dueDate, todayISO) || isSameDay(t.dueDate, todayISO)
      return highPriority && dueRelevant && t.priority !== "Urgent"
    })
    .forEach((task) => {
      actions.push({
        priority: 3,
        sort:
          (isOverdue(task.dueDate, todayISO) ? daysBetween(task.dueDate, todayISO) : 0) * 10 +
          (PRIORITY_RANK[task.priority] ?? 0),
        label: task.title,
        detail: formatTaskDetail(task),
        link: getTaskLink(task),
        taskId: task.id,
      })
    })

  contacts.forEach((contact) => {
    if (contact.nextFollowUpDate && isOverdue(contact.nextFollowUpDate, todayISO)) {
      actions.push({
        priority: 3,
        sort: daysBetween(contact.nextFollowUpDate, todayISO),
        label: `Follow up with ${contact.fullName}`,
        detail: `${contact.companyDisplay} · ${contact.preferredContactMethod} · ${daysBetween(contact.nextFollowUpDate, todayISO)} days overdue`,
        link: `/contacts/${contact.id}`,
      })
    }
  })

  accounts.forEach((account) => {
    if (account.nextFollowUp && isOverdue(account.nextFollowUp, todayISO)) {
      actions.push({
        priority: 3,
        sort: daysBetween(account.nextFollowUp, todayISO),
        label: `Follow up with ${account.businessName}`,
        detail: `${daysBetween(account.nextFollowUp, todayISO)} days overdue`,
        link: `/accounts/${account.id}`,
      })
    }
  })

  tasks
    .filter(
      (t) =>
        !agendaTaskIds.has(t.id) &&
        isTaskActionable(t) &&
        t.priority === "Urgent" &&
        t.dueDate &&
        isSameDay(t.dueDate, todayISO) &&
        !isOverdue(t.dueDate, todayISO)
    )
    .forEach((task) => {
      actions.push({
        priority: 3,
        sort: PRIORITY_RANK[task.priority] ?? 0,
        label: task.title,
        detail: formatTaskDetail(task),
        link: getTaskLink(task),
        taskId: task.id,
      })
    })

  orders.forEach((order) => {
    if (order.orderStatus === "Draft") {
      actions.push({
        priority: 4,
        sort: 0,
        label: `Finalize draft order #${order.orderNumber}`,
        detail: `${order.accountName} · ${formatCurrency(order.orderAmount)}`,
        link: `/orders/${order.id}`,
      })
    }
    if (["Confirmed", "Sent"].includes(order.orderStatus)) {
      actions.push({
        priority: 4,
        sort: 1,
        label: `Confirm shipment for #${order.orderNumber}`,
        detail: `${order.accountName} · ${order.brandName}`,
        link: `/orders/${order.id}`,
      })
    }
    if (isAwaitingPaymentOrder(order) && !isOverdue(order.paymentDueDate, todayISO)) {
      actions.push({
        priority: 4,
        sort: 2,
        label: `Chase payment for #${order.orderNumber}`,
        detail: `${order.accountName} · ${order.paymentStatus}`,
        link: `/orders/${order.id}`,
      })
    }
  })

  commissions
    .filter((c) => c.status === "Pending" && c.commissionAmount > 500)
    .forEach((c) => {
      actions.push({
        priority: 4,
        sort: 3,
        label: `Invoice commission on #${c.orderNumber}`,
        detail: `${c.brandName} · ${formatCurrency(c.commissionAmount)}`,
        link: `/commissions`,
      })
    })

  tasks
    .filter((t) => isTaskActionable(t) && isAdminTask(t))
    .forEach((task) => {
      if (agendaTaskIds.has(task.id)) return
      if (!task.dueDate || isSameDay(task.dueDate, todayISO) || isOverdue(task.dueDate, todayISO)) {
        actions.push({
          priority: 5,
          sort: task.dueDate && isOverdue(task.dueDate, todayISO) ? daysBetween(task.dueDate, todayISO) : 0,
          label: task.title,
          detail: formatTaskDetail(task) || "Admin task",
          link: getTaskLink(task),
          taskId: task.id,
        })
      }
    })

  tasks
    .filter(
      (t) =>
        !agendaTaskIds.has(t.id) &&
        isTaskActionable(t) &&
        !isAdminTask(t) &&
        (t.priority === "Medium" || t.priority === "Low") &&
        t.dueDate &&
        isSameDay(t.dueDate, todayISO)
    )
    .forEach((task) => {
      actions.push({
        priority: 5,
        sort: PRIORITY_RANK[task.priority] ?? 0,
        label: task.title,
        detail: formatTaskDetail(task),
        link: getTaskLink(task),
        taskId: task.id,
      })
    })

  contacts.forEach((contact) => {
    if (contact.nextFollowUpDate && isSameDay(contact.nextFollowUpDate, todayISO)) {
      const exists = actions.some((a) => a.label.includes(contact.fullName) && a.priority <= 3)
      if (!exists) {
        actions.push({
          priority: 3,
          sort: 1,
          label: `Follow up with ${contact.fullName}`,
          detail: contact.companyDisplay,
          link: `/contacts/${contact.id}`,
        })
      }
    }
  })

  const seen = new Set()
  const deduped = actions.filter((a) => {
    const key = a.calendarBlock
      ? `calendar-${a.label}-${a.sort}`
      : a.taskId
        ? `task-${a.taskId}`
        : a.label
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  deduped.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    if (a.priority === 0 && b.priority === 0) return a.sort - b.sort
    return b.sort - a.sort
  })

  return deduped.map((action, index) => ({ ...action, order: index + 1 }))
}

function taskConflictsWithCalendar(task, busyBlocks) {
  if (!task.dueTime || busyBlocks.length === 0) return false
  const start = timeToMinutes(task.dueTime)
  const end = start + 30
  return busyBlocks.some((block) => {
    const blockStart = timeToMinutes(block.eventTime)
    const blockEnd = block.endTime ? timeToMinutes(block.endTime) : blockStart + 60
    return start < blockEnd && blockStart < end
  })
}

function formatTaskDetail(task) {
  const parts = []
  if (task.linkLabel) parts.push(task.linkLabel)
  if (task.type) parts.push(task.type)
  if (task.priority) parts.push(task.priority)
  return parts.join(" · ")
}

function isAwaitingPaymentOrder(order) {
  return (
    order.paymentStatus !== "Paid" &&
    ["Confirmed", "Shipped", "Delivered", "Sent"].includes(order.orderStatus)
  )
}

export { formatTaskDetail, getTaskLink }
