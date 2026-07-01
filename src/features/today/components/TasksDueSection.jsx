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

const LIMIT = 5

function TaskRow({ task, onComplete }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
      <div className="min-w-0 flex-1">
        <Link
          to={getTaskLink(task)}
          className="truncate text-[13px] font-medium text-zinc-200 hover:text-indigo-300"
        >
          {task.title}
        </Link>
        <p className="truncate text-xs text-zinc-500">
          {task.type}
          {task.linkLabel ? ` · ${task.linkLabel}` : ""}
          {task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}
        </p>
      </div>
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
        onClick={() => onComplete(task.id)}
      />
    </div>
  )
}

export function TasksDueSection({ tasksFlat, onCompleteTask }) {
  const [expanded, setExpanded] = useState(false)
  const sorted = sortTasksByPriority(tasksFlat)
  const visible = expanded ? sorted : sorted.slice(0, LIMIT)

  return (
    <Card padding="md" className="flex min-h-[220px] flex-col">
      <SectionHeader title="Tasks Due Today" count={tasksFlat.length} />
      {tasksFlat.length === 0 ? (
        <SectionEmpty>No tasks due today.</SectionEmpty>
      ) : (
        <>
          <div className="space-y-1.5">
            {visible.map((task) => (
              <TaskRow key={task.id} task={task} onComplete={onCompleteTask} />
            ))}
          </div>
          <div className="mt-2 flex justify-end">
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
