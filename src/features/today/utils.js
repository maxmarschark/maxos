import { formatCurrency } from "../../lib/format"
import { getContactName } from "../contacts/utils"

export function getTodayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning, Max"
  if (hour < 17) return "Good afternoon, Max"
  return "Good evening, Max"
}

export function formatTodaySubtitle(priorityCount) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
  return `${date} — ${priorityCount} priorit${priorityCount === 1 ? "y" : "ies"} need attention today`
}

export function daysBetween(fromDate, toDate) {
  if (!fromDate) return 0
  const from = new Date(fromDate)
  const to = new Date(toDate)
  from.setHours(0, 0, 0, 0)
  to.setHours(0, 0, 0, 0)
  return Math.floor((to - from) / (1000 * 60 * 60 * 24))
}

export function isSameDay(dateStr, todayISO) {
  if (!dateStr) return false
  return dateStr.slice(0, 10) === todayISO
}

export function isOverdue(dateStr, todayISO) {
  if (!dateStr) return false
  return dateStr.slice(0, 10) < todayISO
}

export function orderBalanceDue(order) {
  if (order.paymentStatus === "Paid") return 0
  const amount = Number(order.orderAmount) || 0
  if (order.paymentStatus === "Unpaid") return amount
  return amount * 0.5
}

export function isAwaitingPayment(order) {
  return (
    order.paymentStatus !== "Paid" &&
    ["Confirmed", "Shipped", "Delivered", "Sent"].includes(order.orderStatus)
  )
}

export function isAwaitingShipment(order) {
  return ["Confirmed", "Sent"].includes(order.orderStatus)
}

export function buildSchedule({ accounts, contacts, todayISO }) {
  const tasks = []
  accounts.forEach((account) => {
    account.tasks?.forEach((task) => {
      if (task.done) return
      if (isSameDay(task.dueDate, todayISO) || isOverdue(task.dueDate, todayISO)) {
        tasks.push({
          id: `task-${account.id}-${task.id}`,
          type: "task",
          title: task.title,
          subtitle: account.businessName,
          date: task.dueDate,
          overdue: isOverdue(task.dueDate, todayISO),
          accountId: account.id,
          taskId: task.id,
        })
      }
    })
  })

  const meetings = []
  accounts.forEach((account) => {
    if (account.nextFollowUp && isSameDay(account.nextFollowUp, todayISO)) {
      meetings.push({
        id: `meeting-account-${account.id}`,
        type: "meeting",
        title: `Visit ${account.businessName}`,
        subtitle: [account.address, account.city, account.state].filter(Boolean).join(", "),
        date: account.nextFollowUp,
        accountId: account.id,
      })
    }
  })

  contacts.forEach((contact) => {
    if (contact.nextFollowUpDate && isSameDay(contact.nextFollowUpDate, todayISO)) {
      meetings.push({
        id: `meeting-contact-${contact.id}`,
        type: "meeting",
        title: `${contact.preferredContactMethod} ${contact.fullName}`,
        subtitle: contact.companyDisplay,
        date: contact.nextFollowUpDate,
        contactId: contact.id,
      })
    }
  })

  const followUps = []
  contacts.forEach((contact) => {
    if (contact.nextFollowUpDate && isSameDay(contact.nextFollowUpDate, todayISO)) {
      followUps.push({
        id: `followup-${contact.id}`,
        title: contact.fullName,
        subtitle: contact.companyDisplay,
        method: contact.preferredContactMethod,
        contactId: contact.id,
      })
    }
  })

  accounts.forEach((account) => {
    if (account.nextFollowUp && isSameDay(account.nextFollowUp, todayISO)) {
      followUps.push({
        id: `followup-account-${account.id}`,
        title: account.businessName,
        subtitle: account.owner ? `Owner: ${account.owner}` : "Account follow-up",
        method: "Visit",
        accountId: account.id,
      })
    }
  })

  return { tasks, meetings, followUps }
}

export function buildCollectionsDue(orders, todayISO) {
  return orders
    .filter((o) => o.orderStatus !== "Cancelled" && orderBalanceDue(o) > 0)
    .map((order) => {
      const due = order.paymentDueDate
      const daysOverdue = due && isOverdue(due, todayISO) ? daysBetween(due, todayISO) : 0
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        accountName: order.accountName,
        amountDue: orderBalanceDue(order),
        dueDate: due,
        daysOverdue,
        overdue: daysOverdue > 0,
      }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue || b.amountDue - a.amountDue)
}

export function buildContactFollowUps(contacts, todayISO) {
  const dueToday = []
  const overdue = []

  contacts.forEach((contact) => {
    if (!contact.nextFollowUpDate) return
    const item = {
      contactId: contact.id,
      name: contact.fullName,
      company: contact.companyDisplay,
      method: contact.preferredContactMethod,
      date: contact.nextFollowUpDate,
      phone: contact.phone,
    }
    if (isSameDay(contact.nextFollowUpDate, todayISO)) {
      dueToday.push(item)
    } else if (isOverdue(contact.nextFollowUpDate, todayISO)) {
      overdue.push({
        ...item,
        daysOverdue: daysBetween(contact.nextFollowUpDate, todayISO),
      })
    }
  })

  overdue.sort((a, b) => b.daysOverdue - a.daysOverdue)
  return { dueToday, overdue }
}

export function buildOrdersAttention(orders) {
  const draft = orders.filter((o) => o.orderStatus === "Draft")
  const awaitingPayment = orders.filter(isAwaitingPayment)
  const awaitingShipment = orders.filter(isAwaitingShipment)

  return {
    draft: draft.map(mapOrderAttention),
    awaitingPayment: awaitingPayment.map(mapOrderAttention),
    awaitingShipment: awaitingShipment.map(mapOrderAttention),
  }
}

function mapOrderAttention(order) {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    accountName: order.accountName,
    brandName: order.brandName,
    orderAmount: order.orderAmount,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
  }
}

export function buildCommissionSnapshot(commissions, todayISO) {
  const month = todayISO.slice(0, 7)
  const pending = commissions.filter((c) => c.status === "Pending")
  const paidThisMonth = commissions.filter(
    (c) => c.status === "Paid" && c.paidDate?.slice(0, 7) === month
  )
  const outstanding = commissions.filter(
    (c) => ["Pending", "Invoiced", "Disputed"].includes(c.status)
  )

  const sum = (items) => items.reduce((s, c) => s + c.commissionAmount, 0)

  return {
    pending: { total: sum(pending), count: pending.length },
    paidThisMonth: { total: sum(paidThisMonth), count: paidThisMonth.length },
    outstanding: { total: sum(outstanding), count: outstanding.length },
  }
}

export function flattenFollowUps(followUps) {
  return [
    ...followUps.overdue.map((f) => ({ ...f, overdue: true })),
    ...followUps.dueToday.map((f) => ({ ...f, overdue: false })),
  ]
}

export function flattenOrdersAttention(ordersAttention) {
  return [
    ...ordersAttention.draft.map((o) => ({ ...o, category: "Draft" })),
    ...ordersAttention.awaitingPayment.map((o) => ({ ...o, category: "Awaiting Payment" })),
    ...ordersAttention.awaitingShipment.map((o) => ({ ...o, category: "Awaiting Shipment" })),
  ]
}

export function buildTopMetrics({ collections, commissionSnapshot, orders, followUpsFlat, tasksDueFlat = [] }) {
  const open = orders.filter((o) => !["Cancelled", "Delivered"].includes(o.orderStatus))
  const inTransit = open.filter((o) => o.orderStatus === "Shipped")
  const collectionsTotal = collections.reduce((s, c) => s + c.amountDue, 0)
  const overdueFollowUps = followUpsFlat.filter((f) => f.overdue).length
  const overdueTasks = tasksDueFlat.filter((t) => t.overdue).length

  return {
    collections: {
      value: formatCurrency(collectionsTotal),
      count: collections.length,
    },
    pendingCommissions: {
      value: formatCurrency(commissionSnapshot.pending.total),
      count: commissionSnapshot.pending.count,
    },
    openOrders: {
      value: open.length,
      inTransit: inTransit.length,
    },
    followUpsDue: {
      count: followUpsFlat.length + tasksDueFlat.length,
      overdue: overdueFollowUps + overdueTasks,
    },
  }
}

export function buildKpis({ orders, contacts, accounts, collections, todayISO }) {
  const callsToMake = contacts.filter(
    (c) =>
      c.phone &&
      c.preferredContactMethod === "Call" &&
      c.nextFollowUpDate &&
      (isSameDay(c.nextFollowUpDate, todayISO) || isOverdue(c.nextFollowUpDate, todayISO))
  ).length

  const visitsPlanned = accounts.filter(
    (a) => a.nextFollowUp && (isSameDay(a.nextFollowUp, todayISO) || isOverdue(a.nextFollowUp, todayISO))
  ).length

  const revenueAtRisk = orders
    .filter(
      (o) =>
        o.orderStatus !== "Cancelled" &&
        o.orderStatus !== "Delivered" &&
        o.paymentStatus !== "Paid"
    )
    .reduce((s, o) => s + (Number(o.orderAmount) || 0), 0)

  const pendingOrders = orders.filter(
    (o) => !["Cancelled", "Delivered"].includes(o.orderStatus)
  ).length

  const collectionsTotal = collections.reduce((s, c) => s + c.amountDue, 0)

  return {
    callsToMake,
    visitsPlanned,
    revenueAtRisk: formatCurrency(revenueAtRisk),
    pendingOrders,
    collections: formatCurrency(collectionsTotal),
  }
}

export function buildActivityFeed({ orders, contacts, accounts, commissions }) {
  const events = []

  orders.forEach((order) => {
    if (order.createdAt) {
      events.push({
        id: `order-${order.id}-created`,
        type: "order_created",
        label: `Order #${order.orderNumber} created`,
        detail: `${order.accountName} · ${order.brandName}`,
        timestamp: order.createdAt,
        link: `/orders/${order.id}`,
      })
    }
  })

  contacts.forEach((contact) => {
    if (contact.createdAt) {
      events.push({
        id: `contact-${contact.id}-created`,
        type: "contact_added",
        label: `${getContactName(contact)} added`,
        detail: contact.companyDisplay,
        timestamp: contact.createdAt,
        link: `/contacts/${contact.id}`,
      })
    }
  })

  accounts.forEach((account) => {
    if (account.updatedAt && account.updatedAt !== account.createdAt) {
      events.push({
        id: `account-${account.id}-updated`,
        type: "account_edited",
        label: `${account.businessName} updated`,
        detail: account.city ? `${account.city}, ${account.state}` : "",
        timestamp: account.updatedAt,
        link: `/accounts/${account.id}`,
      })
    }
  })

  commissions.forEach((c) => {
    if (c.status === "Paid" && c.paidDate) {
      events.push({
        id: `commission-${c.orderId}-paid`,
        type: "commission_paid",
        label: `Commission paid on #${c.orderNumber}`,
        detail: `${c.accountName} · ${formatCurrency(c.commissionAmount)}`,
        timestamp: `${c.paidDate}T12:00:00.000Z`,
        link: `/commissions`,
      })
    }
  })

  return events
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20)
}
