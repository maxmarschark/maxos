import { useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { Badge } from "../../../components/ui/Badge"
import { Button } from "../../../components/ui/Button"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { formatDate } from "../../../lib/format"
import { PRIORITY_VARIANTS } from "../../tasks/constants"
import { getTaskLink, sortTasksByPriority } from "../../tasks/utils"
import {
  dashboardCardClass,
  dashboardFooterClass,
  dashboardListClass,
  dashboardRowClass,
} from "./dashboardLayout"
import { cn } from "../../../lib/cn"

const LIMIT = 5

function TaskRow({ task, onComplete }) {
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
        <div className="flex flex-col items-end gap-1">
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
        </div>
        <Button
          variant="ghost"
          size="icon"
          icon={CheckCircle2}
          aria-label="Mark complete"
          onClick={() => onComplete(task.id)}
          className="shrink-0"
        />
      </div>
    </div>
  )
}

export function TasksDueSection({ tasksFlat, onCompleteTask }) {
  const [expanded, setExpanded] = useState(false)
  const sorted = sortTasksByPriority(tasksFlat)
  const visible = expanded ? sorted : sorted.slice(0, LIMIT)

  return (
    <Card padding="md" className={dashboardCardClass}>
      <SectionHeader title="Tasks Due Today" count={tasksFlat.length} />
      {tasksFlat.length === 0 ? (
        <SectionEmpty centered>No tasks due today.</SectionEmpty>
      ) : (
        <>
          <div className={dashboardListClass}>
            {visible.map((task) => (
              <TaskRow key={task.id} task={task} onComplete={onCompleteTask} />
            ))}
          </div>
          <div className={dashboardFooterClass}>
            <ViewAllToggle
              expanded={expanded}
              total={tasksFlat.length}
              limit={LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
