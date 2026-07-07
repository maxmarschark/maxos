import { useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { Badge } from "../../../components/ui/Badge"
import { Button } from "../../../components/ui/Button"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { formatDate } from "../../../lib/format"
import {
  dashboardCardClass,
  dashboardFooterClass,
  dashboardListClass,
  dashboardRowClass,
} from "./dashboardLayout"
import { cn } from "../../../lib/cn"

const LIMIT = 3

function FollowUpRow({ item, onComplete }) {
  return (
    <div className={cn(dashboardRowClass, "flex gap-3")}>
      <div className="min-w-0 flex-1">
        <Link
          to={`/contacts/${item.contactId}`}
          className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-200 hover:text-indigo-300"
        >
          {item.name}
        </Link>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {item.company} · {formatDate(item.date)}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1.5 pt-0.5">
        {item.overdue && (
          <Badge variant="danger" className="shrink-0 text-[10px]">
            {item.daysOverdue}d
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          icon={CheckCircle2}
          aria-label="Mark complete"
          onClick={() => onComplete(item.contactId)}
          className="shrink-0"
        />
      </div>
    </div>
  )
}

export function FollowUpsSection({ followUpsFlat, onCompleteFollowUp }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? followUpsFlat : followUpsFlat.slice(0, LIMIT)

  return (
    <Card padding="md" className={dashboardCardClass}>
      <SectionHeader title="Follow-Ups Due" count={followUpsFlat.length} />
      {followUpsFlat.length === 0 ? (
        <SectionEmpty centered>No follow-ups due.</SectionEmpty>
      ) : (
        <>
          <div className={dashboardListClass}>
            {visible.map((item) => (
              <FollowUpRow
                key={item.contactId}
                item={item}
                onComplete={onCompleteFollowUp}
              />
            ))}
          </div>
          <div className={dashboardFooterClass}>
            <ViewAllToggle
              expanded={expanded}
              total={followUpsFlat.length}
              limit={LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
