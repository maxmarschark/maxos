import { useState } from "react"
import { Link } from "react-router-dom"
import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { Badge } from "../../../components/ui/Badge"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { formatCurrency, formatDate } from "../../../lib/format"
import {
  dashboardCardClass,
  dashboardFooterClass,
  dashboardListClass,
  dashboardRowClass,
} from "./dashboardLayout"
import { cn } from "../../../lib/cn"

const LIMIT = 3

function CollectionRow({ item }) {
  return (
    <Link
      to={`/orders/${item.orderId}`}
      className={cn(
        dashboardRowClass,
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 transition-colors hover:border-zinc-700/60"
      )}
    >
      <p className="truncate text-xs font-medium text-zinc-400">#{item.orderNumber}</p>
      <p className="shrink-0 text-right text-sm font-medium tabular-nums text-zinc-300">
        {formatCurrency(item.amountDue)}
      </p>
      <p className="truncate text-[13px] font-medium text-zinc-200">{item.accountName}</p>
      {item.overdue ? (
        <Badge variant="danger" className="shrink-0 justify-self-end text-[10px]">
          {item.daysOverdue}d
        </Badge>
      ) : (
        <Badge variant="warning" className="shrink-0 justify-self-end text-[10px]">
          Due
        </Badge>
      )}
      <p className="col-span-2 truncate text-xs text-zinc-600">{formatDate(item.dueDate)}</p>
    </Link>
  )
}

export function CollectionsSection({ collections }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? collections : collections.slice(0, LIMIT)
  const total = collections.reduce((s, c) => s + c.amountDue, 0)

  return (
    <Card padding="md" className={dashboardCardClass}>
      <SectionHeader title="Collections Due" count={collections.length} />
      {collections.length === 0 ? (
        <SectionEmpty centered>No unpaid balances.</SectionEmpty>
      ) : (
        <>
          <p className="mb-2 shrink-0 text-xs text-zinc-500">
            {formatCurrency(total)} outstanding
          </p>
          <div className={dashboardListClass}>
            {visible.map((item) => (
              <CollectionRow key={item.orderId} item={item} />
            ))}
          </div>
          <div className={dashboardFooterClass}>
            <ViewAllToggle
              expanded={expanded}
              total={collections.length}
              limit={LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
