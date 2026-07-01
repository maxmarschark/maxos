import { DollarSign } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { EmptyState } from "../../../../components/ui/EmptyState"
import { MetricCard } from "../../../../components/ui/MetricCard"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/Table"
import { Badge } from "../../../../components/ui/Badge"
import { EntityLink } from "../../../../components/ui/EntityLink"
import { formatCurrency, formatDate } from "../../../../lib/format"
import { getAccountMetrics } from "../../../../lib/relationships"
import { STATUS_VARIANTS } from "../../../commissions/constants"

export function AccountCommissionsTab({ accountId, orders, commissions }) {
  const metrics = getAccountMetrics(accountId, orders, commissions)
  const accountOrders = orders.filter(
    (o) => o.accountId === accountId && o.orderStatus !== "Cancelled"
  )
  const orderIds = new Set(accountOrders.map((o) => o.id))
  const records = commissions
    .filter((c) => orderIds.has(c.orderId))
    .sort((a, b) => String(b.orderDate).localeCompare(String(a.orderDate)))

  if (records.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          icon={DollarSign}
          title="No commission activity"
          description="Commissions are generated from orders placed with this account."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MetricCard
          label="Total Sales"
          value={formatCurrency(metrics.totalSales)}
          meta={`${metrics.orderCount} orders`}
          accent="emerald"
        />
        <MetricCard
          label="Commission Generated"
          value={formatCurrency(metrics.totalCommission)}
          meta={`${formatCurrency(metrics.pendingCommission)} pending`}
          accent="amber"
        />
        <MetricCard
          label="Commission Paid"
          value={formatCurrency(metrics.paidCommission)}
          accent="indigo"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead className="text-right">Commission</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((c) => (
            <TableRow key={c.orderId}>
              <TableCell>
                <EntityLink to={`/orders/${c.orderId}`}>#{c.orderNumber}</EntityLink>
              </TableCell>
              <TableCell>
                <EntityLink to={`/brands/${c.brandId}`}>{c.brandName}</EntityLink>
              </TableCell>
              <TableCell className="text-right font-medium text-emerald-400">
                {formatCurrency(c.commissionAmount)}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[c.status]} className="normal-case tracking-normal">
                  {c.status}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-500">{formatDate(c.orderDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
