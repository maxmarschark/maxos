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

const LIMIT = 3

function FollowUpRow({ item, onComplete }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
      <div className="min-w-0 flex-1">
        <Link
          to={`/contacts/${item.contactId}`}
          className="truncate text-[13px] font-medium text-zinc-200 hover:text-indigo-300"
        >
          {item.name}
        </Link>
        <p className="truncate text-xs text-zinc-500">
          {item.company} · {formatDate(item.date)}
        </p>
      </div>
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
      />
    </div>
  )
}

export function FollowUpsSection({ followUpsFlat, onCompleteFollowUp }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? followUpsFlat : followUpsFlat.slice(0, LIMIT)

  return (
    <Card padding="md" className="flex min-h-[220px] flex-col">
      <SectionHeader title="Follow-Ups Due" count={followUpsFlat.length} />
      {followUpsFlat.length === 0 ? (
        <SectionEmpty>No follow-ups due.</SectionEmpty>
      ) : (
        <>
          <div className="space-y-1.5">
            {visible.map((item) => (
              <FollowUpRow
                key={item.contactId}
                item={item}
                onComplete={onCompleteFollowUp}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-end">
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
