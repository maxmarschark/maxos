import { getBrandMetrics } from "../../lib/relationships"
import { buildActivityTimeline, buildRelationshipContext } from "../../lib/relationships"
import { getTodayISO, isOverdue, isSameDay } from "../today/utils"
import { isTaskActionable, buildTasksOverdue, buildTasksDueToday } from "../tasks/utils"
import { normalizeAssetType } from "../brand-files/utils"

function isOpenDeal(deal) {
  return deal.stage !== "Won" && deal.stage !== "Lost"
}

function brandMatchesAccount(account, brandName) {
  return account.brandsCarried?.some(
    (name) => name.toLowerCase() === brandName.toLowerCase()
  )
}

function daysSince(isoDate) {
  if (!isoDate) return Infinity
  const today = getTodayISO()
  const from = new Date(isoDate.slice(0, 10))
  const to = new Date(today)
  from.setHours(0, 0, 0, 0)
  to.setHours(0, 0, 0, 0)
  return Math.floor((to - from) / (1000 * 60 * 60 * 24))
}

export function buildBrandAssistantContext({
  brand,
  accounts,
  contacts,
  orders,
  deals,
  tasks,
  assets,
  commissions,
  activityEvents = [],
}) {
  const todayISO = getTodayISO()
  const brandName = brand.brandName

  const brandAccounts = accounts.filter((a) => brandMatchesAccount(a, brandName))
  const brandAccountIds = new Set(brandAccounts.map((a) => a.id))
  const brandContacts = contacts.filter((c) => c.brandId === brand.id)
  const brandContactIds = new Set(brandContacts.map((c) => c.id))

  const brandOrders = orders.filter(
    (o) => o.brandId === brand.id && o.orderStatus !== "Cancelled"
  )
  const brandDeals = deals.filter((d) => d.brandId === brand.id)
  const openDeals = brandDeals.filter(isOpenDeal)

  const brandTasks = tasks.filter(
    (t) =>
      t.brandId === brand.id ||
      (t.accountId && brandAccountIds.has(t.accountId)) ||
      (t.contactId && brandContactIds.has(t.contactId)) ||
      (t.orderId && brandOrders.some((o) => o.id === t.orderId))
  )

  const actionableTasks = brandTasks.filter(isTaskActionable)
  const overdueTasks = buildTasksOverdue(actionableTasks, todayISO)
  const tasksDueToday = buildTasksDueToday(actionableTasks, todayISO)

  const overdueFollowUpContacts = brandContacts.filter(
    (c) => c.nextFollowUpDate && isOverdue(c.nextFollowUpDate, todayISO)
  )
  const dueTodayFollowUpContacts = brandContacts.filter(
    (c) => c.nextFollowUpDate && isSameDay(c.nextFollowUpDate, todayISO)
  )

  const accountsNeedingFollowUp = brandAccounts.filter((a) => {
    if (!a.nextFollowUp) return false
    return isOverdue(a.nextFollowUp, todayISO) || isSameDay(a.nextFollowUp, todayISO)
  })

  const featuredAsset = assets.find((a) => a.isFeatured) ?? null
  const hasSalesSheet = assets.some(
    (a) => normalizeAssetType(a.category) === "Sales Sheet"
  )
  const hasCatalog = assets.some((a) => normalizeAssetType(a.category) === "Catalog")
  const hasPriceList = assets.some(
    (a) => normalizeAssetType(a.category) === "Price List"
  )

  const staleOpenDeals = openDeals.filter((deal) => {
    const updated = deal.updatedAt ?? deal.createdAt
    return daysSince(updated) > 14
  })

  const metrics = getBrandMetrics(brand.id, orders, commissions)

  const relationshipCtx = buildRelationshipContext({
    accounts,
    contacts,
    orders,
    commissions,
    tasks,
    brands: [brand],
  })
  const timeline = buildActivityTimeline(relationshipCtx, { brandId: brand.id }, 10)
  const recentActivity =
    activityEvents.length > 0
      ? activityEvents
          .filter(
            (e) =>
              e.brandId === brand.id ||
              (e.accountId && brandAccountIds.has(e.accountId)) ||
              brandOrders.some((o) => o.id === e.orderId)
          )
          .slice(0, 8)
      : timeline

  const unpaidOrders = brandOrders.filter(
    (o) => o.paymentStatus !== "Paid" && o.orderStatus !== "Cancelled"
  )

  return {
    brand,
    todayISO,
    brandAccounts,
    brandContacts,
    brandOrders,
    brandDeals,
    openDeals,
    staleOpenDeals,
    brandTasks: actionableTasks,
    overdueTasks,
    tasksDueToday,
    overdueFollowUpContacts,
    dueTodayFollowUpContacts,
    accountsNeedingFollowUp,
    assets,
    featuredAsset,
    hasSalesSheet,
    hasCatalog,
    hasPriceList,
    metrics,
    recentActivity,
    unpaidOrders,
    noteEntries: brand.noteEntries ?? [],
    internalNotes: brand.notes ?? "",
    products: brand.products ?? [],
  }
}
