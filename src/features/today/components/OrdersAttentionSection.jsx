import { useState } from "react"
import { Link } from "react-router-dom"
import { Card } from "../../../components/ui/Card"
import { Badge } from "../../../components/ui/Badge"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { formatCurrency } from "../../../lib/format"
import { ORDER_STATUS_VARIANTS, PAYMENT_STATUS_VARIANTS } from "../../orders/constants"

const LIMIT = 3

const categoryVariants = {
  Draft: ORDER_STATUS_VARIANTS.Draft,
  "Awaiting Payment": PAYMENT_STATUS_VARIANTS.Unpaid,
  "Awaiting Shipment": ORDER_STATUS_VARIANTS.Confirmed,
}

export function OrdersAttentionSection({ ordersFlat }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? ordersFlat : ordersFlat.slice(0, LIMIT)

  return (
    <Card padding="md">
      <SectionHeader title="Orders Requiring Attention" count={ordersFlat.length} />
      {ordersFlat.length === 0 ? (
        <p className="text-sm text-zinc-600">All orders are on track.</p>
      ) : (
        <>
          <div className="space-y-1.5">
            {visible.map((order) => (
              <Link
                key={`${order.orderId}-${order.category}`}
                to={`/orders/${order.orderId}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 transition-colors hover:border-zinc-700/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-zinc-200">
                    #{order.orderNumber} · {order.accountName}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{order.brandName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-zinc-400">
                    {formatCurrency(order.orderAmount)}
                  </span>
                  <Badge variant={categoryVariants[order.category] ?? "default"} className="text-[10px]">
                    {order.category}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
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
