import { useState } from "react"
import { Link } from "react-router-dom"
import { Card } from "../../../components/ui/Card"
import { Badge } from "../../../components/ui/Badge"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { formatCurrency, formatDate } from "../../../lib/format"

const LIMIT = 3

export function CollectionsSection({ collections }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? collections : collections.slice(0, LIMIT)
  const total = collections.reduce((s, c) => s + c.amountDue, 0)

  return (
    <Card padding="md">
      <SectionHeader title="Collections Due" count={collections.length} />
      {collections.length === 0 ? (
        <p className="text-sm text-zinc-600">No unpaid balances.</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-zinc-500">{formatCurrency(total)} outstanding</p>
          <div className="space-y-1.5">
            {visible.map((item) => (
              <Link
                key={item.orderId}
                to={`/orders/${item.orderId}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 transition-colors hover:border-zinc-700/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-zinc-200">
                    #{item.orderNumber} · {item.accountName}
                  </p>
                  <p className="text-xs text-zinc-600">{formatDate(item.dueDate)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-medium text-zinc-300">
                    {formatCurrency(item.amountDue)}
                  </span>
                  {item.overdue ? (
                    <Badge variant="danger" className="text-[10px]">
                      {item.daysOverdue}d
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[10px]">
                      Due
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
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
