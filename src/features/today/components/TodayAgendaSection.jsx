import { useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, CheckCircle2, ExternalLink } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { Badge } from "../../../components/ui/Badge"
import { Button } from "../../../components/ui/Button"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { EventSourceBadge } from "../../calendar/components/EventSourceBadge"
import { formatDate } from "../../../lib/format"
import { formatEventTimeRange } from "../../calendar/utils"
import { PRIORITY_VARIANTS } from "../../tasks/constants"
import { getTaskLink } from "../../tasks/utils"
import { formatAgendaTime } from "../agenda"
import {
  dashboardCardClass,
  dashboardFooterClass,
  dashboardListClass,
  dashboardRowClass,
} from "./dashboardLayout"
import { cn } from "../../../lib/cn"

const LIMIT = 8

function TimedAgendaRow({ item, onCompleteTask }) {
  const timeLabel = formatAgendaTime(item)

  if (item.kind === "calendar") {
    const event = item.event
    const isGoogle = event.source === "google"
    const row = (
      <div
        className={cn(
          dashboardRowClass,
          "grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 gap-y-1 border-indigo-900/40 bg-indigo-950/20"
        )}
      >
        <p className="pt-0.5 text-xs font-medium tabular-nums text-indigo-300">{timeLabel}</p>
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <CalendarDays size={14} className="mt-0.5 shrink-0 text-indigo-400" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-100">
                {event.title}
              </p>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                <EventSourceBadge
                  source={event.source}
                  className="shrink-0 text-[10px] normal-case tracking-normal"
                />
                <p className="truncate text-xs text-zinc-500">
                  {formatEventTimeRange(event)}
                </p>
              </div>
            </div>
            {isGoogle && event.htmlLink && (
              <ExternalLink size={14} className="mt-0.5 shrink-0 text-zinc-600" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    )

    if (isGoogle && event.htmlLink) {
      return (
        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="block">
          {row}
        </a>
      )
    }

    return row
  }

  const task = item.task
  return (
    <div className={cn(dashboardRowClass, "grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3")}>
      <p className="pt-0.5 text-xs font-medium tabular-nums text-zinc-400">{timeLabel}</p>
      <div className="flex min-w-0 gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to={getTaskLink(task)}
            className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-200 hover:text-indigo-300"
          >
            {task.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {task.type}
            {task.linkLabel ? ` · ${task.linkLabel}` : ""}
            {task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-start gap-1.5 pt-0.5">
          <Badge
            variant={PRIORITY_VARIANTS[task.priority] ?? "default"}
            className="shrink-0 text-[10px] normal-case tracking-normal"
          >
            {task.priority}
          </Badge>
          {task.overdue && (
            <Badge variant="danger" className="shrink-0 text-[10px]">
              {task.daysOverdue}d
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            icon={CheckCircle2}
            aria-label="Mark complete"
            onClick={() => onCompleteTask(task.id)}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  )
}

function FlexibleTaskRow({ task, onCompleteTask }) {
  return (
    <div className={cn(dashboardRowClass, "flex gap-3")}>
      <div className="min-w-0 flex-1">
        <Link
          to={getTaskLink(task)}
          className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-200 hover:text-indigo-300"
        >
          {task.title}
        </Link>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {task.type}
          {task.linkLabel ? ` · ${task.linkLabel}` : ""}
          {task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1.5 pt-0.5">
        <Badge
          variant={PRIORITY_VARIANTS[task.priority] ?? "default"}
          className="shrink-0 text-[10px] normal-case tracking-normal"
        >
          {task.priority}
        </Badge>
        {task.overdue && (
          <Badge variant="danger" className="shrink-0 text-[10px]">
            {task.daysOverdue}d
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          icon={CheckCircle2}
          aria-label="Mark complete"
          onClick={() => onCompleteTask(task.id)}
          className="shrink-0"
        />
      </div>
    </div>
  )
}

export function TodayAgendaSection({ agenda, onCompleteTask }) {
  const [expanded, setExpanded] = useState(false)
  const allItems = [...agenda.timed, ...agenda.flexible]
  const visibleTimed = expanded ? agenda.timed : agenda.timed.slice(0, LIMIT)
  const visibleFlexible = expanded ? agenda.flexible : agenda.flexible.slice(0, Math.max(0, LIMIT - visibleTimed.length))

  return (
    <Card padding="md" className={cn(dashboardCardClass, "md:col-span-2")}>
      <SectionHeader title="Today Agenda" count={agenda.totalCount} />
      {agenda.totalCount === 0 ? (
        <SectionEmpty centered>No tasks or calendar events scheduled for today.</SectionEmpty>
      ) : (
        <>
          <div className={dashboardListClass}>
            {visibleTimed.map((item) => (
              <TimedAgendaRow key={item.id} item={item} onCompleteTask={onCompleteTask} />
            ))}
            {visibleFlexible.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  Flexible Tasks
                </p>
                {visibleFlexible.map((item) => (
                  <FlexibleTaskRow
                    key={item.id}
                    task={item.task}
                    onCompleteTask={onCompleteTask}
                  />
                ))}
              </div>
            )}
          </div>
          <div className={dashboardFooterClass}>
            <ViewAllToggle
              expanded={expanded}
              total={allItems.length}
              limit={LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
