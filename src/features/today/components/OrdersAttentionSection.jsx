import { useState } from "react"
import { Link } from "react-router-dom"
import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { Badge } from "../../../components/ui/Badge"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { formatCurrency } from "../../../lib/format"
import { ORDER_STATUS_VARIANTS, PAYMENT_STATUS_VARIANTS } from "../../orders/constants"
import {
  dashboardCardClass,
  dashboardFooterClass,
  dashboardListClass,
  dashboardRowClass,
} from "./dashboardLayout"
import { cn } from "../../../lib/cn"

const LIMIT = 3

const categoryVariants = {
  Draft: ORDER_STATUS_VARIANTS.Draft,
  "Awaiting Payment": PAYMENT_STATUS_VARIANTS.Unpaid,
  "Awaiting Shipment": ORDER_STATUS_VARIANTS.Confirmed,
}

function OrderAttentionRow({ order }) {
  return (
    <Link
      to={`/orders/${order.orderId}`}
      className={cn(
        dashboardRowClass,
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 transition-colors hover:border-zinc-700/60"
      )}
    >
      <p className="truncate text-xs font-medium text-zinc-400">#{order.orderNumber}</p>
      <p className="shrink-0 text-right text-xs font-medium tabular-nums text-zinc-300">
        {formatCurrency(order.orderAmount)}
      </p>
      <p className="truncate text-[13px] font-medium text-zinc-200">{order.accountName}</p>
      <Badge
        variant={categoryVariants[order.category] ?? "default"}
        className="max-w-[9.5rem] shrink-0 justify-self-end truncate text-[10px] normal-case tracking-normal"
        title={order.category}
      >
        {order.category}
      </Badge>
      <p className="col-span-2 truncate text-xs text-zinc-500">{order.brandName}</p>
    </Link>
  )
}

export function OrdersAttentionSection({ ordersFlat }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? ordersFlat : ordersFlat.slice(0, LIMIT)

  return (
    <Card padding="md" className={dashboardCardClass}>
      <SectionHeader title="Orders Requiring Attention" count={ordersFlat.length} />
      {ordersFlat.length === 0 ? (
        <SectionEmpty centered>All orders are on track.</SectionEmpty>
      ) : (
        <>
          <div className={dashboardListClass}>
            {visible.map((order) => (
              <OrderAttentionRow key={`${order.orderId}-${order.category}`} order={order} />
            ))}
          </div>
          <div className={dashboardFooterClass}>
            <ViewAllToggle
              expanded={expanded}
              total={ordersFlat.length}
              limit={LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
