import {
  BarChart3,
  Building2,
  Users,
  Tag,
  Handshake,
  TrendingUp,
  Trophy,
  Package,
  DollarSign,
  Percent,
  Calculator,
  Target,
  CheckSquare,
  AlertCircle,
  Calendar,
  UserCheck,
  ShoppingCart,
  Wallet,
  Award,
} from "lucide-react"
import { useReportsDashboard } from "../features/reports/useReportsDashboard"
import { useActivity } from "../features/activity/useActivity"
import { DEAL_STAGES } from "../features/deals/constants"
import { PageHeader } from "../components/ui/PageHeader"
import { StorageModeBadge } from "../components/ui/StorageModeBadge"
import { MetricCard } from "../components/ui/MetricCard"
import { Card } from "../components/ui/Card"
import { SectionEmpty } from "../components/ui/SectionEmpty"
import { SectionHeader } from "../features/today/components/SectionHeader"
import { formatCurrency, formatDate } from "../lib/format"
import { formatEventTimeRange } from "../features/calendar/utils"
import { EventSourceBadge } from "../features/calendar/components/EventSourceBadge"

const UPCOMING_LIMIT = 6
const BRAND_LIMIT = 6
const EMPTY_META = "No activity yet"

function ReportSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>
      {children}
    </section>
  )
}

function metaCount(count, label) {
  return count === 0 ? EMPTY_META : label
}

export function ReportsPage() {
  const metrics = useReportsDashboard()
  const { storageMode } = useActivity()

  const { salesSnapshot, pipeline, followUps, orders, brands } = metrics
  const visibleEvents = followUps.upcomingEvents.slice(0, UPCOMING_LIMIT)
  const visibleBrands = brands.revenueByBrand.slice(0, BRAND_LIMIT)

  const hasAnyData =
    salesSnapshot.totalAccounts > 0 ||
    salesSnapshot.totalContacts > 0 ||
    salesSnapshot.activeBrands > 0 ||
    salesSnapshot.openDeals > 0 ||
    pipeline.totalDeals > 0 ||
    orders.ordersThisMonthCount > 0 ||
    orders.outstandingOrdersCount > 0 ||
    brands.revenueByBrand.length > 0 ||
    followUps.tasksDueTodayCount > 0 ||
    followUps.overdueTasksCount > 0 ||
    followUps.upcomingEventsCount > 0 ||
    followUps.contactsNeedingFollowUp > 0

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BarChart3}
        title="Reports"
        description="Live metrics from your CRM data"
        badge={<StorageModeBadge mode={storageMode} />}
      />

      {!hasAnyData && (
        <Card padding="none">
          <SectionEmpty>No activity yet</SectionEmpty>
        </Card>
      )}

      <ReportSection title="Sales Snapshot">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <MetricCard
            icon={Building2}
            label="Total Accounts"
            value={salesSnapshot.totalAccounts}
            meta={metaCount(salesSnapshot.totalAccounts, `${salesSnapshot.totalAccounts} account${salesSnapshot.totalAccounts !== 1 ? "s" : ""}`)}
            accent="indigo"
          />
          <MetricCard
            icon={Users}
            label="Total Contacts"
            value={salesSnapshot.totalContacts}
            meta={metaCount(salesSnapshot.totalContacts, `${salesSnapshot.totalContacts} contact${salesSnapshot.totalContacts !== 1 ? "s" : ""}`)}
            accent="indigo"
          />
          <MetricCard
            icon={Tag}
            label="Active Brands"
            value={salesSnapshot.activeBrands}
            meta={metaCount(salesSnapshot.activeBrands, `${salesSnapshot.activeBrands} active`)}
            accent="emerald"
          />
          <MetricCard
            icon={Handshake}
            label="Open Deals"
            value={salesSnapshot.openDeals}
            meta={metaCount(salesSnapshot.openDeals, `${salesSnapshot.openDeals} in pipeline`)}
            accent="amber"
          />
          <MetricCard
            icon={TrendingUp}
            label="Pipeline Value"
            value={salesSnapshot.pipelineValueFormatted}
            meta={metaCount(salesSnapshot.openDeals, `${salesSnapshot.openDeals} open deal${salesSnapshot.openDeals !== 1 ? "s" : ""}`)}
            accent="amber"
          />
          <MetricCard
            icon={Trophy}
            label="Closed Revenue"
            value={salesSnapshot.closedRevenueFormatted}
            meta={metaCount(salesSnapshot.closedRevenue, "Won deals")}
            accent="emerald"
          />
          <MetricCard
            icon={Package}
            label="Orders Revenue"
            value={salesSnapshot.ordersRevenueFormatted}
            meta={metaCount(salesSnapshot.ordersRevenue, "All active orders")}
            accent="indigo"
          />
          <MetricCard
            icon={DollarSign}
            label="Pending Commissions"
            value={salesSnapshot.pendingCommissionsFormatted}
            meta={metaCount(salesSnapshot.pendingCommissionsCount, `${salesSnapshot.pendingCommissionsCount} pending`)}
            accent="amber"
          />
        </div>
      </ReportSection>

      <ReportSection title="Pipeline">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <Card padding="md" className="md:col-span-2 xl:col-span-1">
            <SectionHeader title="Deals by Stage" count={pipeline.totalDeals} />
            {pipeline.totalDeals === 0 ? (
              <SectionEmpty>No activity yet</SectionEmpty>
            ) : (
              <div className="space-y-1.5">
                {DEAL_STAGES.map((stage) => (
                  <div
                    key={stage}
                    className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2"
                  >
                    <span className="text-xs text-zinc-500">{stage}</span>
                    <span className="text-sm font-medium text-zinc-200">
                      {pipeline.dealsByStage[stage] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <MetricCard
            icon={Percent}
            label="Win Rate"
            value={pipeline.winRateFormatted}
            meta={metaCount(pipeline.closedCount, `${pipeline.closedCount} closed deal${pipeline.closedCount !== 1 ? "s" : ""}`)}
            accent="emerald"
          />
          <MetricCard
            icon={Calculator}
            label="Average Deal Size"
            value={pipeline.averageDealSizeFormatted}
            meta={metaCount(pipeline.totalDeals, `${pipeline.totalDeals} deal${pipeline.totalDeals !== 1 ? "s" : ""}`)}
            accent="indigo"
          />
          <MetricCard
            icon={Target}
            label="Expected Revenue"
            value={pipeline.expectedRevenueFormatted}
            meta={metaCount(pipeline.expectedRevenue, "Weighted by stage")}
            accent="amber"
          />
        </div>
      </ReportSection>

      <ReportSection title="Follow Ups">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <MetricCard
            icon={CheckSquare}
            label="Tasks Due Today"
            value={followUps.tasksDueTodayCount}
            meta={metaCount(followUps.tasksDueTodayCount, `${followUps.tasksDueTodayCount} due today`)}
            accent="indigo"
          />
          <MetricCard
            icon={AlertCircle}
            label="Overdue Tasks"
            value={followUps.overdueTasksCount}
            meta={metaCount(followUps.overdueTasksCount, `${followUps.overdueTasksCount} overdue`)}
            accent="red"
          />
          <MetricCard
            icon={Calendar}
            label="Upcoming Calendar Events"
            value={followUps.upcomingEventsCount}
            meta={metaCount(followUps.upcomingEventsCount, `${followUps.upcomingEventsCount} scheduled`)}
            accent="emerald"
          />
          <MetricCard
            icon={UserCheck}
            label="Contacts Needing Follow-up"
            value={followUps.contactsNeedingFollowUp}
            meta={metaCount(followUps.contactsNeedingFollowUp, `${followUps.overdueFollowUpsCount} overdue`)}
            accent="amber"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Card padding="md">
            <SectionHeader title="Upcoming Events" count={followUps.upcomingEventsCount} />
            {followUps.upcomingEventsCount === 0 ? (
              <SectionEmpty>No activity yet</SectionEmpty>
            ) : (
              <div className="space-y-1.5">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-[13px] font-medium text-zinc-200">{event.title}</p>
                        <EventSourceBadge
                          source={event.source}
                          className="text-[10px] normal-case tracking-normal"
                        />
                      </div>
                      <p className="truncate text-xs text-zinc-500">
                        {formatDate(event.eventDate)} · {formatEventTimeRange(event)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding="md">
            <SectionHeader title="Contacts Needing Follow-up" count={followUps.contactsNeedingFollowUp} />
            {followUps.contactsNeedingFollowUp === 0 ? (
              <SectionEmpty>No activity yet</SectionEmpty>
            ) : (
              <div className="space-y-1.5">
                {followUps.followUpContacts.slice(0, UPCOMING_LIMIT).map((contact) => (
                  <div
                    key={contact.contactId}
                    className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-zinc-200">{contact.name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {contact.company} · {formatDate(contact.date)}
                      </p>
                    </div>
                    {contact.overdue && (
                      <span className="shrink-0 text-[10px] font-medium text-red-400">Overdue</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </ReportSection>

      <ReportSection title="Orders">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <MetricCard
            icon={ShoppingCart}
            label="Orders This Month"
            value={orders.ordersThisMonthCount}
            meta={metaCount(orders.ordersThisMonthCount, `${orders.ordersThisMonthCount} this month`)}
            accent="indigo"
          />
          <MetricCard
            icon={TrendingUp}
            label="Revenue This Month"
            value={orders.revenueThisMonthFormatted}
            meta={metaCount(orders.revenueThisMonth, "Current month")}
            accent="emerald"
          />
          <MetricCard
            icon={Wallet}
            label="Outstanding Orders"
            value={orders.outstandingOrdersValueFormatted}
            meta={metaCount(orders.outstandingOrdersCount, `${orders.outstandingOrdersCount} unpaid`)}
            accent="red"
          />
        </div>
      </ReportSection>

      <ReportSection title="Brands">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Card padding="md" className="md:col-span-2">
            <SectionHeader title="Revenue by Brand" count={brands.revenueByBrand.length} />
            {brands.revenueByBrand.length === 0 ? (
              <SectionEmpty>No activity yet</SectionEmpty>
            ) : (
              <div className="space-y-1.5">
                {visibleBrands.map((row) => (
                  <div
                    key={row.brandId ?? "unassigned"}
                    className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-zinc-200">{row.brandName}</p>
                      <p className="text-xs text-zinc-500">
                        {row.orderCount} order{row.orderCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-emerald-400">
                      {formatCurrency(row.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <div className="grid grid-cols-1 gap-2">
            <MetricCard
              icon={Award}
              label="Top Brand"
              value={brands.topBrandName}
              meta={metaCount(brands.topBrandRevenue, brands.topBrandRevenueFormatted)}
              accent="emerald"
            />
            <MetricCard
              icon={Tag}
              label="Active Brands"
              value={brands.activeBrandsCount}
              meta={metaCount(brands.activeBrandsCount, `${brands.activeBrandsCount} active`)}
              accent="indigo"
            />
          </div>
        </div>
      </ReportSection>
    </div>
  )
}
