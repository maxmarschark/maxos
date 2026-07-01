import { useNavigate } from "react-router-dom"
import { CheckSquare } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { EmptyState } from "../../../components/ui/EmptyState"
import { Badge } from "../../../components/ui/Badge"
import { EntityLink } from "../../../components/ui/EntityLink"
import { formatDate } from "../../../lib/format"
import { PRIORITY_VARIANTS, STATUS_VARIANTS } from "../../tasks/constants"
import { getTaskLink } from "../../tasks/utils"

export function ContactTasksSection({ contactId, tasks }) {
  const navigate = useNavigate()
  const openTasks = tasks
    .filter((t) => t.contactId === contactId && t.status !== "Complete")
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))

  if (openTasks.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          icon={CheckSquare}
          title="No open tasks"
          description="Follow-up tasks linked to this contact will appear here."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {openTasks.map((task) => (
        <Card
          key={task.id}
          padding="sm"
          className="cursor-pointer transition-colors hover:border-zinc-700/60"
          onClick={() => navigate(getTaskLink(task))}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <EntityLink to={getTaskLink(task)} className="text-sm font-medium">
                {task.title}
              </EntityLink>
              <p className="mt-0.5 text-xs text-zinc-500">
                {task.type}
                {task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Badge variant={PRIORITY_VARIANTS[task.priority]} className="text-[10px] normal-case tracking-normal">
                {task.priority}
              </Badge>
              <Badge variant={STATUS_VARIANTS[task.status]} className="text-[10px] normal-case tracking-normal">
                {task.status}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
