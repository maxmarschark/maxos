import { formatCurrency } from "../../lib/format"
import { DEAL_STAGES } from "../deals/constants"
import {
  buildContactFollowUps,
  orderBalanceDue,
  isOverdue,
  isSameDay,
} from "../today/utils"
import { buildTasksDueToday, buildTasksOverdue } from "../tasks/utils"
import { filterUpcomingEvents, sortEventsByDateTime, withMaxOsSource } from "../calendar/utils"

const STAGE_WEIGHTS = {
  Prospect: 0.1,
  Qualified: 0.25,
  Proposal: 0.5,
  Negotiation: 0.75,
}

export function isOpenDeal(deal) {
  return deal.stage !== "Won" && deal.stage !== "Lost"
}

function isInMonth(dateStr, monthPrefix) {
  return dateStr?.slice(0, 7) === monthPrefix
}

function addDaysISO(iso, days) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function buildDealsByStage(deals) {
  const counts = Object.fromEntries(DEAL_STAGES.map((stage) => [stage, 0]))
  deals.forEach((deal) => {
    if (counts[deal.stage] != null) {
      counts[deal.stage] += 1
    }
  })
  return counts
}

function buildRevenueByBrand(orders, brands) {
  const map = new Map()

  orders
    .filter((o) => o.orderStatus !== "Cancelled")
    .forEach((order) => {
      const brand = brands.find((b) => b.id === order.brandId)
      const key = order.brandId || "unassigned"
      const existing = map.get(key) ?? {
        brandId: order.brandId,
        brandName: brand?.brandName ?? "Unassigned",
        revenue: 0,
        orderCount: 0,
      }
      existing.revenue += Number(order.orderAmount) || 0
      existing.orderCount += 1
      map.set(key, existing)
    })

  return [...map.values()].sort((a, b) => b.revenue - a.revenue)
}

function countContactsNeedingFollowUp(contacts, todayISO) {
  const horizon = addDaysISO(todayISO, 7)
  return contacts.filter((contact) => {
    if (!contact.nextFollowUpDate) return false
    const date = contact.nextFollowUpDate.slice(0, 10)
    return date <= horizon
  }).length
}

export function buildReportMetrics({
  accounts,
  contacts,
  brands,
  deals,
  orders,
  commissions,
  tasks,
  calendarEvents,
  todayISO,
}) {
  const monthPrefix = todayISO.slice(0, 7)
  const activeBrands = brands.filter((b) => b.status === "Active")
  const openDeals = deals.filter(isOpenDeal)
  const pipelineValue = openDeals.reduce((s, d) => s + (Number(d.value) || 0), 0)
  const wonDeals = deals.filter((d) => d.stage === "Won")
  const lostDeals = deals.filter((d) => d.stage === "Lost")
  const closedRevenue = wonDeals.reduce((s, d) => s + (Number(d.value) || 0), 0)

  const activeOrders = orders.filter((o) => o.orderStatus !== "Cancelled")
  const ordersRevenue = activeOrders.reduce((s, o) => s + (Number(o.orderAmount) || 0), 0)

  const pendingCommissions = commissions.filter((c) => c.status === "Pending")
  const pendingCommissionsTotal = pendingCommissions.reduce(
    (s, c) => s + c.commissionAmount,
    0
  )

  const dealsByStage = buildDealsByStage(deals)
  const closedCount = wonDeals.length + lostDeals.length
  const winRate = closedCount > 0 ? (wonDeals.length / closedCount) * 100 : 0
  const averageDealSize =
    deals.length > 0
      ? deals.reduce((s, d) => s + (Number(d.value) || 0), 0) / deals.length
      : 0
  const expectedRevenue = openDeals.reduce(
    (s, d) => s + (Number(d.value) || 0) * (STAGE_WEIGHTS[d.stage] ?? 0),
    0
  )

  const tasksDueToday = buildTasksDueToday(tasks, todayISO)
  const overdueTasks = buildTasksOverdue(tasks, todayISO)
  const followUps = buildContactFollowUps(contacts, todayISO)
  const contactsNeedingFollowUp = countContactsNeedingFollowUp(contacts, todayISO)
  const followUpContacts = contacts
    .filter((c) => c.nextFollowUpDate)
    .map((c) => ({
      contactId: c.id,
      name: c.fullName,
      company: c.companyDisplay,
      date: c.nextFollowUpDate,
      overdue: isOverdue(c.nextFollowUpDate, todayISO),
      dueToday: isSameDay(c.nextFollowUpDate, todayISO),
    }))
    .filter((c) => c.overdue || c.dueToday || c.date.slice(0, 10) <= addDaysISO(todayISO, 7))
    .sort((a, b) => a.date.localeCompare(b.date))

  const sortedEvents = sortEventsByDateTime(withMaxOsSource(calendarEvents))
  const upcomingEvents = filterUpcomingEvents(sortedEvents, todayISO)

  const ordersThisMonth = activeOrders.filter((o) => isInMonth(o.orderDate, monthPrefix))
  const revenueThisMonth = ordersThisMonth.reduce(
    (s, o) => s + (Number(o.orderAmount) || 0),
    0
  )
  const outstandingOrders = activeOrders.filter((o) => orderBalanceDue(o) > 0)
  const outstandingOrdersValue = outstandingOrders.reduce(
    (s, o) => s + orderBalanceDue(o),
    0
  )

  const revenueByBrand = buildRevenueByBrand(orders, brands)
  const topBrand = revenueByBrand[0] ?? null

  return {
    salesSnapshot: {
      totalAccounts: accounts.length,
      totalContacts: contacts.length,
      activeBrands: activeBrands.length,
      openDeals: openDeals.length,
      pipelineValue,
      pipelineValueFormatted: formatCurrency(pipelineValue),
      closedRevenue,
      closedRevenueFormatted: formatCurrency(closedRevenue),
      ordersRevenue,
      ordersRevenueFormatted: formatCurrency(ordersRevenue),
      pendingCommissions: pendingCommissionsTotal,
      pendingCommissionsFormatted: formatCurrency(pendingCommissionsTotal),
      pendingCommissionsCount: pendingCommissions.length,
    },
    pipeline: {
      dealsByStage,
      winRate,
      winRateFormatted: `${Math.round(winRate)}%`,
      averageDealSize,
      averageDealSizeFormatted: formatCurrency(averageDealSize),
      expectedRevenue,
      expectedRevenueFormatted: formatCurrency(expectedRevenue),
      totalDeals: deals.length,
      closedCount,
    },
    followUps: {
      tasksDueTodayCount: tasksDueToday.length,
      overdueTasksCount: overdueTasks.length,
      upcomingEventsCount: upcomingEvents.length,
      upcomingEvents,
      contactsNeedingFollowUp,
      followUpContacts,
      overdueFollowUpsCount: followUps.overdue.length,
    },
    orders: {
      ordersThisMonthCount: ordersThisMonth.length,
      revenueThisMonth,
      revenueThisMonthFormatted: formatCurrency(revenueThisMonth),
      outstandingOrdersCount: outstandingOrders.length,
      outstandingOrdersValue,
      outstandingOrdersValueFormatted: formatCurrency(outstandingOrdersValue),
    },
    brands: {
      revenueByBrand,
      topBrandName: topBrand?.brandName ?? "—",
      topBrandRevenue: topBrand?.revenue ?? 0,
      topBrandRevenueFormatted: formatCurrency(topBrand?.revenue ?? 0),
      activeBrandsCount: activeBrands.length,
    },
  }
}
