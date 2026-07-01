import { loadFromStorage } from "../../lib/storage"
import { ACCOUNTS_STORAGE_KEY } from "../accounts/constants"
import { SEED_ACCOUNTS } from "../accounts/seed"
import { BRANDS_STORAGE_KEY } from "../brands/constants"
import { SEED_BRANDS } from "../brands/seed"
import { formatCurrency } from "../../lib/format"

export function calcCommissionAmount(orderAmount, commissionPercent) {
  const amount = Number(orderAmount) || 0
  const percent = Number(commissionPercent) || 0
  return Math.round(amount * (percent / 100) * 100) / 100
}

export function loadAccountsForOrders() {
  return loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS)
}

export function loadBrandsForOrders() {
  return loadFromStorage(BRANDS_STORAGE_KEY, SEED_BRANDS)
}

export function resolveAccountName(accountId, accounts) {
  return accounts.find((a) => a.id === accountId)?.businessName ?? "Unknown Account"
}

export function resolveBrandName(brandId, brands) {
  return brands.find((b) => b.id === brandId)?.brandName ?? "Unknown Brand"
}

export function enrichOrder(order, accounts, brands) {
  return {
    ...order,
    accountName: resolveAccountName(order.accountId, accounts),
    brandName: resolveBrandName(order.brandId, brands),
  }
}

export function enrichOrders(orders, accounts, brands) {
  return orders.map((order) => enrichOrder(order, accounts, brands))
}

export function isOpenOrder(order) {
  return order.orderStatus !== "Cancelled" && order.orderStatus !== "Delivered"
}

function balanceDue(order) {
  if (order.paymentStatus === "Paid") return 0
  if (order.paymentStatus === "Unpaid") return Number(order.orderAmount) || 0
  return (Number(order.orderAmount) || 0) * 0.5
}

function pendingCommissionAmount(order) {
  if (order.paymentStatus === "Paid") return 0
  const commission = Number(order.commissionAmount) || 0
  if (order.paymentStatus === "Unpaid") return commission
  return commission * 0.5
}

export function computeDashboardMetrics(orders) {
  const open = orders.filter(isOpenOrder)
  const pending = open.filter((o) => o.orderStatus === "Draft" || o.orderStatus === "Sent" || o.orderStatus === "Confirmed")
  const inTransit = open.filter((o) => o.orderStatus === "Shipped")

  const collectionsOrders = orders.filter(
    (o) => o.paymentStatus === "Unpaid" || o.paymentStatus === "Partially Paid"
  )
  const collectionsTotal = collectionsOrders.reduce((sum, o) => sum + balanceDue(o), 0)
  const overdueCount = collectionsOrders.filter(
    (o) => o.paymentDueDate && new Date(o.paymentDueDate) < new Date("2025-06-30")
  ).length

  const pendingCommissionsTotal = orders.reduce(
    (sum, o) => sum + pendingCommissionAmount(o),
    0
  )

  return {
    openOrders: {
      value: open.length,
      pending: pending.length,
      inTransit: inTransit.length,
    },
    collectionsDue: {
      value: formatCurrency(collectionsTotal),
      count: collectionsOrders.length,
      overdue: overdueCount,
    },
    pendingCommissions: {
      value: formatCurrency(pendingCommissionsTotal),
      count: orders.filter((o) => pendingCommissionAmount(o) > 0).length,
    },
  }
}
