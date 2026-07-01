import { formatCurrency } from "../../lib/format"
import { daysBetween, isOverdue, isSameDay, orderBalanceDue } from "./utils"

export function buildMyDay({
  orders,
  contacts,
  accounts,
  commissions,
  todayISO,
}) {
  const actions = []

  orders
    .filter((o) => o.orderStatus !== "Cancelled" && orderBalanceDue(o) > 0)
    .forEach((order) => {
      const due = order.paymentDueDate
      if (due && isOverdue(due, todayISO)) {
        actions.push({
          priority: 1,
          sort: daysBetween(due, todayISO),
          label: `Collect payment from ${order.accountName}`,
          detail: `#${order.orderNumber} · ${formatCurrency(orderBalanceDue(order))} · ${daysBetween(due, todayISO)} days overdue`,
          link: `/orders/${order.id}`,
        })
      }
    })

  contacts.forEach((contact) => {
    if (contact.nextFollowUpDate && isOverdue(contact.nextFollowUpDate, todayISO)) {
      actions.push({
        priority: 2,
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
        priority: 2,
        sort: daysBetween(account.nextFollowUp, todayISO),
        label: `Follow up with ${account.businessName}`,
        detail: `${daysBetween(account.nextFollowUp, todayISO)} days overdue`,
        link: `/accounts/${account.id}`,
      })
    }
  })

  orders.forEach((order) => {
    if (order.orderStatus === "Draft") {
      actions.push({
        priority: 3,
        sort: 0,
        label: `Finalize draft order #${order.orderNumber}`,
        detail: `${order.accountName} · ${formatCurrency(order.orderAmount)}`,
        link: `/orders/${order.id}`,
      })
    }
    if (["Confirmed", "Sent"].includes(order.orderStatus)) {
      actions.push({
        priority: 3,
        sort: 1,
        label: `Confirm shipment for #${order.orderNumber}`,
        detail: `${order.accountName} · ${order.brandName}`,
        link: `/orders/${order.id}`,
      })
    }
    if (isAwaitingPaymentOrder(order) && !isOverdue(order.paymentDueDate, todayISO)) {
      actions.push({
        priority: 3,
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
        priority: 3,
        sort: 3,
        label: `Invoice commission on #${c.orderNumber}`,
        detail: `${c.brandName} · ${formatCurrency(c.commissionAmount)}`,
        link: `/commissions`,
      })
    })

  accounts.forEach((account) => {
    account.tasks?.forEach((task) => {
      if (task.done) return
      if (isSameDay(task.dueDate, todayISO)) {
        actions.push({
          priority: 4,
          sort: 0,
          label: task.title,
          detail: account.businessName,
          link: `/accounts/${account.id}`,
        })
      }
    })
  })

  contacts.forEach((contact) => {
    if (
      contact.nextFollowUpDate &&
      isSameDay(contact.nextFollowUpDate, todayISO) &&
      contact.preferredContactMethod === "Call"
    ) {
      actions.push({
        priority: 4,
        sort: 1,
        label: `Call ${contact.fullName}`,
        detail: contact.companyDisplay,
        link: `/contacts/${contact.id}`,
      })
    }
  })

  contacts.forEach((contact) => {
    if (contact.nextFollowUpDate && isSameDay(contact.nextFollowUpDate, todayISO)) {
      const exists = actions.some(
        (a) => a.label.includes(contact.fullName) && a.priority <= 2
      )
      if (!exists) {
        actions.push({
          priority: 4,
          sort: 2,
          label: `Follow up with ${contact.fullName}`,
          detail: contact.companyDisplay,
          link: `/contacts/${contact.id}`,
        })
      }
    }
  })

  const seen = new Set()
  const deduped = actions.filter((a) => {
    if (seen.has(a.label)) return false
    seen.add(a.label)
    return true
  })

  deduped.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return b.sort - a.sort
  })

  return deduped.map((action, index) => ({ ...action, order: index + 1 }))
}

function isAwaitingPaymentOrder(order) {
  return (
    order.paymentStatus !== "Paid" &&
    ["Confirmed", "Shipped", "Delivered", "Sent"].includes(order.orderStatus)
  )
}
