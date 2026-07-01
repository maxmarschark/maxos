import { loadFromStorage } from "../../lib/storage"
import { ACCOUNTS_STORAGE_KEY } from "../accounts/constants"
import { SEED_ACCOUNTS } from "../accounts/seed"
import { BRANDS_STORAGE_KEY } from "../brands/constants"
import { SEED_BRANDS } from "../brands/seed"
import { ORDERS_STORAGE_KEY } from "../orders/constants"
import { buildSeedOrders } from "../orders/seed"
import { calcCommissionAmount } from "../orders/utils"
import { formatCurrency } from "../../lib/format"

export function loadOrdersForCommissions() {
  return loadFromStorage(ORDERS_STORAGE_KEY, buildSeedOrders())
}

export function loadBrandsForCommissions() {
  return loadFromStorage(BRANDS_STORAGE_KEY, SEED_BRANDS)
}

export function loadAccountsForCommissions() {
  return loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS)
}

export function resolveCommissionPercent(order, brand) {
  if (order.commissionPercent != null && order.commissionPercent !== "") {
    return Number(order.commissionPercent) || 0
  }
  return Number(brand?.commissionDefault) || 0
}

export function buildCommissionRecords(orders, brands, accounts, storedMeta) {
  const metaByOrderId = new Map(storedMeta.map((m) => [m.orderId, m]))

  return orders
    .filter((order) => order.orderStatus !== "Cancelled")
    .map((order) => {
      const brand = brands.find((b) => b.id === order.brandId)
      const account = accounts.find((a) => a.id === order.accountId)
      const meta = metaByOrderId.get(order.id)

      const commissionPercent = resolveCommissionPercent(order, brand)
      const calculatedAmount = calcCommissionAmount(order.orderAmount, commissionPercent)
      const amountManual = meta?.amountManual ?? false
      const commissionAmount = amountManual
        ? Number(meta?.amountOverride ?? calculatedAmount)
        : calculatedAmount

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        accountId: order.accountId,
        accountName: account?.businessName ?? "Unknown Account",
        brandId: order.brandId,
        brandName: brand?.brandName ?? "Unknown Brand",
        orderAmount: Number(order.orderAmount) || 0,
        commissionPercent,
        commissionAmount,
        calculatedAmount,
        amountManual,
        status: meta?.status ?? "Pending",
        dueDate: meta?.dueDate ?? order.paymentDueDate ?? null,
        paidDate: meta?.paidDate ?? null,
        notes: meta?.notes ?? "",
        orderDate: order.orderDate,
      }
    })
}

export function computeCommissionSummary(commissions) {
  const sumByStatus = (status) =>
    commissions
      .filter((c) => c.status === status)
      .reduce((sum, c) => sum + c.commissionAmount, 0)

  const pendingTotal = sumByStatus("Pending")
  const paidTotal = sumByStatus("Paid")
  const invoicedTotal = sumByStatus("Invoiced")
  const disputedTotal = sumByStatus("Disputed")

  return {
    pending: {
      value: formatCurrency(pendingTotal),
      raw: pendingTotal,
      count: commissions.filter((c) => c.status === "Pending").length,
    },
    paid: {
      value: formatCurrency(paidTotal),
      raw: paidTotal,
      count: commissions.filter((c) => c.status === "Paid").length,
    },
    invoiced: {
      value: formatCurrency(invoicedTotal),
      raw: invoicedTotal,
      count: commissions.filter((c) => c.status === "Invoiced").length,
    },
    disputed: {
      value: formatCurrency(disputedTotal),
      raw: disputedTotal,
      count: commissions.filter((c) => c.status === "Disputed").length,
    },
  }
}

export function computeBrandBreakdown(commissions) {
  const map = new Map()

  commissions.forEach((c) => {
    const key = c.brandId || "unknown"
    const existing = map.get(key) ?? {
      brandId: c.brandId,
      brandName: c.brandName,
      total: 0,
      paid: 0,
      pending: 0,
      count: 0,
    }

    existing.total += c.commissionAmount
    existing.count += 1
    if (c.status === "Paid") {
      existing.paid += c.commissionAmount
    } else if (c.status !== "Written Off") {
      existing.pending += c.commissionAmount
    }

    map.set(key, existing)
  })

  return [...map.values()].sort((a, b) => b.total - a.total)
}

export function computeAccountBreakdown(commissions) {
  const map = new Map()

  commissions.forEach((c) => {
    const key = c.accountId || "unknown"
    const existing = map.get(key) ?? {
      accountId: c.accountId,
      accountName: c.accountName,
      total: 0,
      paid: 0,
      pending: 0,
      count: 0,
    }

    existing.total += c.commissionAmount
    existing.count += 1
    if (c.status === "Paid") {
      existing.paid += c.commissionAmount
    } else if (c.status !== "Written Off") {
      existing.pending += c.commissionAmount
    }

    map.set(key, existing)
  })

  return [...map.values()].sort((a, b) => b.total - a.total)
}

export function computeDashboardPendingCommissions(commissions) {
  const pending = commissions.filter((c) => c.status === "Pending")
  const total = pending.reduce((sum, c) => sum + c.commissionAmount, 0)
  return {
    value: formatCurrency(total),
    count: pending.length,
  }
}

export function computeDashboardPaidCommissions(commissions) {
  const paid = commissions.filter((c) => c.status === "Paid")
  const total = paid.reduce((sum, c) => sum + c.commissionAmount, 0)
  return {
    value: formatCurrency(total),
    count: paid.length,
  }
}
