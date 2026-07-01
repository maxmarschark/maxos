import { formatCurrency } from "./format"
import { getContactName } from "../features/contacts/utils"

export function findBrandByName(brandName, brands) {
  if (!brandName) return null
  return brands.find((b) => b.brandName.toLowerCase() === brandName.toLowerCase()) ?? null
}

export function getAccountBrands(account, brands) {
  return (account.brandsCarried ?? [])
    .map((name) => {
      const brand = findBrandByName(name, brands)
      return brand
        ? { id: brand.id, name: brand.brandName, status: brand.status }
        : { id: null, name, status: null }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getOrdersForContact(contact, orders) {
  return orders.filter(
    (o) =>
      o.orderStatus !== "Cancelled" &&
      (o.accountId === contact.accountId ||
        (contact.brandId && o.brandId === contact.brandId))
  )
}

export function getPrimaryContactForOrder(order, contacts) {
  const atAccount = contacts.filter((c) => c.accountId === order.accountId)
  if (atAccount.length === 0) return null

  const priority = ["Buyer", "Manager", "Owner", "Staff"]
  for (const type of priority) {
    const match = atAccount.find((c) => c.type === type)
    if (match) return match
  }
  return atAccount[0]
}

export function getCommissionForOrder(orderId, commissions) {
  return commissions.find((c) => c.orderId === orderId) ?? null
}

export function sumOrderSales(orders) {
  return orders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + (Number(o.orderAmount) || 0), 0)
}

export function sumCommissions(commissionRecords) {
  return commissionRecords.reduce((sum, c) => sum + (Number(c.commissionAmount) || 0), 0)
}

export function getBrandMetrics(brandId, orders, commissions) {
  const brandOrders = orders.filter(
    (o) => o.brandId === brandId && o.orderStatus !== "Cancelled"
  )
  const orderIds = new Set(brandOrders.map((o) => o.id))
  const brandCommissions = commissions.filter((c) => orderIds.has(c.orderId))

  return {
    orderCount: brandOrders.length,
    totalSales: sumOrderSales(brandOrders),
    totalCommission: sumCommissions(brandCommissions),
    paidCommission: sumCommissions(brandCommissions.filter((c) => c.status === "Paid")),
    pendingCommission: sumCommissions(
      brandCommissions.filter((c) => ["Pending", "Invoiced", "Disputed"].includes(c.status))
    ),
  }
}

export function getAccountMetrics(accountId, orders, commissions) {
  const accountOrders = orders.filter(
    (o) => o.accountId === accountId && o.orderStatus !== "Cancelled"
  )
  const orderIds = new Set(accountOrders.map((o) => o.id))
  const accountCommissions = commissions.filter((c) => orderIds.has(c.orderId))

  return {
    orderCount: accountOrders.length,
    totalSales: sumOrderSales(accountOrders),
    totalCommission: sumCommissions(accountCommissions),
    paidCommission: sumCommissions(accountCommissions.filter((c) => c.status === "Paid")),
    pendingCommission: sumCommissions(
      accountCommissions.filter((c) => ["Pending", "Invoiced", "Disputed"].includes(c.status))
    ),
  }
}

const FOLLOW_UP_TYPES = new Set(["Call", "Text", "Email", "Visit", "Order Follow-up"])

function pushEvent(events, event) {
  if (event?.timestamp) events.push(event)
}

export function buildActivityTimeline(ctx, filter = null, limit = null) {
  const { accounts, contacts, orders, commissions, tasks, brands } = ctx
  const events = []

  accounts.forEach((account) => {
    if (filter?.accountId && account.id !== filter.accountId) return

    if (account.createdAt) {
      pushEvent(events, {
        id: `account-${account.id}-created`,
        type: "account_created",
        label: `${account.businessName} created`,
        detail: account.city ? `${account.city}, ${account.state}` : "",
        timestamp: account.createdAt,
        link: `/accounts/${account.id}`,
        accountId: account.id,
      })
    }

    if (account.updatedAt && account.updatedAt !== account.createdAt) {
      if (!filter?.accountId || account.id === filter.accountId) {
        pushEvent(events, {
          id: `account-${account.id}-updated`,
          type: "account_edited",
          label: `${account.businessName} updated`,
          detail: account.owner ? `Owner: ${account.owner}` : "",
          timestamp: account.updatedAt,
          link: `/accounts/${account.id}`,
          accountId: account.id,
        })
      }
    }

    account.notes?.forEach((note) => {
      if (filter?.accountId && account.id !== filter.accountId) return
      pushEvent(events, {
        id: `account-${account.id}-note-${note.id}`,
        type: "note_added",
        label: `Note on ${account.businessName}`,
        detail: note.content?.slice(0, 80) ?? "",
        timestamp: note.createdAt,
        link: `/accounts/${account.id}`,
        accountId: account.id,
      })
    })
  })

  orders.forEach((order) => {
    if (filter?.accountId && order.accountId !== filter.accountId) return
    if (filter?.brandId && order.brandId !== filter.brandId) return
    if (filter?.orderId && order.id !== filter.orderId) return
    if (filter?.contactId) {
      const contact = contacts.find((c) => c.id === filter.contactId)
      if (
        contact &&
        order.accountId !== contact.accountId &&
        order.brandId !== contact.brandId
      ) {
        return
      }
    }

    if (order.createdAt) {
      pushEvent(events, {
        id: `order-${order.id}-created`,
        type: "order_created",
        label: `Order #${order.orderNumber} created`,
        detail: `${order.accountName} · ${order.brandName}`,
        timestamp: order.createdAt,
        link: `/orders/${order.id}`,
        orderId: order.id,
        accountId: order.accountId,
        brandId: order.brandId,
      })
    }

    if (order.updatedAt && order.updatedAt !== order.createdAt) {
      pushEvent(events, {
        id: `order-${order.id}-updated`,
        type: "order_updated",
        label: `Order #${order.orderNumber} updated`,
        detail: `${order.orderStatus} · ${order.paymentStatus}`,
        timestamp: order.updatedAt,
        link: `/orders/${order.id}`,
        orderId: order.id,
        accountId: order.accountId,
        brandId: order.brandId,
      })
    }
  })

  contacts.forEach((contact) => {
    if (filter?.accountId && contact.accountId !== filter.accountId) return
    if (filter?.brandId && contact.brandId !== filter.brandId) return
    if (filter?.contactId && contact.id !== filter.contactId) return

    if (contact.createdAt) {
      pushEvent(events, {
        id: `contact-${contact.id}-created`,
        type: "contact_added",
        label: `${getContactName(contact)} added`,
        detail: contact.companyDisplay,
        timestamp: contact.createdAt,
        link: `/contacts/${contact.id}`,
        contactId: contact.id,
        accountId: contact.accountId,
        brandId: contact.brandId,
      })
    }

    if (contact.lastContactDate) {
      pushEvent(events, {
        id: `contact-${contact.id}-followup-${contact.lastContactDate}`,
        type: "follow_up_logged",
        label: `Follow-up with ${getContactName(contact)}`,
        detail: `Last contact · ${contact.preferredContactMethod ?? "—"}`,
        timestamp: `${contact.lastContactDate}T12:00:00.000Z`,
        link: `/contacts/${contact.id}`,
        contactId: contact.id,
        accountId: contact.accountId,
      })
    }
  })

  commissions.forEach((c) => {
    if (filter?.accountId && c.accountId !== filter.accountId) return
    if (filter?.brandId && c.brandId !== filter.brandId) return
    if (filter?.orderId && c.orderId !== filter.orderId) return

    if (c.status === "Paid" && c.paidDate) {
      pushEvent(events, {
        id: `commission-${c.orderId}-paid`,
        type: "commission_paid",
        label: `Commission paid on #${c.orderNumber}`,
        detail: `${c.accountName} · ${formatCurrency(c.commissionAmount)}`,
        timestamp: `${c.paidDate}T12:00:00.000Z`,
        link: `/orders/${c.orderId}`,
        orderId: c.orderId,
        accountId: c.accountId,
        brandId: c.brandId,
      })
    }
  })

  tasks.forEach((task) => {
    if (filter?.accountId && task.accountId !== filter.accountId) return
    if (filter?.brandId && task.brandId !== filter.brandId) return
    if (filter?.contactId && task.contactId !== filter.contactId) return
    if (filter?.orderId && task.orderId !== filter.orderId) return

    if (task.createdAt) {
      const isFollowUp = FOLLOW_UP_TYPES.has(task.type) && (task.contactId || task.accountId)
      pushEvent(events, {
        id: `task-${task.id}-created`,
        type: isFollowUp ? "follow_up_logged" : "task_created",
        label: isFollowUp ? `Follow-up: ${task.title}` : `Task created: ${task.title}`,
        detail: [task.type, task.priority].filter(Boolean).join(" · "),
        timestamp: task.createdAt,
        link: task.orderId
          ? `/orders/${task.orderId}`
          : task.contactId
            ? `/contacts/${task.contactId}`
            : task.accountId
              ? `/accounts/${task.accountId}`
              : "/tasks",
        taskId: task.id,
        accountId: task.accountId,
        contactId: task.contactId,
        brandId: task.brandId,
        orderId: task.orderId,
      })
    }

    if (task.status === "Complete" && task.completedAt) {
      pushEvent(events, {
        id: `task-${task.id}-completed`,
        type: "task_completed",
        label: `Task completed: ${task.title}`,
        detail: task.linkLabel || task.type,
        timestamp: task.completedAt,
        link: task.orderId
          ? `/orders/${task.orderId}`
          : task.contactId
            ? `/contacts/${task.contactId}`
            : task.accountId
              ? `/accounts/${task.accountId}`
              : "/tasks",
        taskId: task.id,
        accountId: task.accountId,
        contactId: task.contactId,
      })
    }
  })

  brands.forEach((brand) => {
    if (filter?.brandId && brand.id !== filter.brandId) return
    if (brand.createdAt) {
      pushEvent(events, {
        id: `brand-${brand.id}-created`,
        type: "brand_created",
        label: `Brand ${brand.brandName} added`,
        detail: brand.status,
        timestamp: brand.createdAt,
        link: `/brands/${brand.id}`,
        brandId: brand.id,
      })
    }
  })

  const sorted = events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  return limit ? sorted.slice(0, limit) : sorted
}

export function buildRelationshipContext({
  accounts,
  contacts,
  orders,
  commissions,
  tasks,
  brands,
}) {
  return { accounts, contacts, orders, commissions, tasks, brands }
}

export function getContactFollowUpHistory(contact, tasks) {
  const relatedTasks = tasks
    .filter((t) => t.contactId === contact.id || t.accountId === contact.accountId)
    .sort((a, b) => {
      const aTime = a.completedAt || a.dueDate || a.createdAt
      const bTime = b.completedAt || b.dueDate || b.createdAt
      return new Date(bTime) - new Date(aTime)
    })

  const events = []

  if (contact.lastContactDate) {
    events.push({
      id: `contact-last-${contact.id}`,
      label: "Last contact logged",
      detail: formatDateShort(contact.lastContactDate),
      timestamp: `${contact.lastContactDate}T12:00:00.000Z`,
      link: `/contacts/${contact.id}`,
    })
  }

  if (contact.nextFollowUpDate) {
    events.push({
      id: `contact-next-${contact.id}`,
      label: "Next follow-up scheduled",
      detail: formatDateShort(contact.nextFollowUpDate),
      timestamp: `${contact.nextFollowUpDate}T09:00:00.000Z`,
      link: `/contacts/${contact.id}`,
    })
  }

  relatedTasks.forEach((task) => {
    events.push({
      id: `task-history-${task.id}`,
      label: task.status === "Complete" ? `Completed: ${task.title}` : task.title,
      detail: [task.type, task.status, task.dueDate ? formatDateShort(task.dueDate) : null]
        .filter(Boolean)
        .join(" · "),
      timestamp: task.completedAt || task.dueDate || task.createdAt,
      link: `/contacts/${contact.id}`,
    })
  })

  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

function formatDateShort(dateStr) {
  if (!dateStr) return ""
  try {
    return new Date(dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" }
    )
  } catch {
    return dateStr
  }
}
