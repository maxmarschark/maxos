import { CheckCircle2, Circle } from "lucide-react"
import { Card, CardHeader } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { cn } from "../../lib/cn"

const priorityVariants = {
  high: "danger",
  medium: "warning",
  low: "default",
}

function TaskRow({ task }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-zinc-800/60 px-3.5 py-3 transition-colors",
        task.done ? "bg-zinc-950/30 opacity-60" : "bg-zinc-950/50 hover:border-zinc-700/60"
      )}
    >
      <button type="button" className="mt-0.5 shrink-0 text-zinc-600 hover:text-indigo-400">
        {task.done ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Circle size={18} />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-[13px] font-medium text-zinc-200",
            task.done && "line-through text-zinc-500"
          )}
        >
          {task.title}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-600">{task.account}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500">{task.due}</span>
        </div>
      </div>
      {!task.done && (
        <Badge variant={priorityVariants[task.priority]} className="shrink-0">
          {task.priority}
        </Badge>
      )}
    </div>
  )
}

export function TasksPanel({ tasks }) {
  const pending = tasks.filter((t) => !t.done).length

  return (
    <Card padding="md">
      <CardHeader
        title="Today's Tasks"
        description={`${pending} remaining · ${tasks.length} total`}
      />
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </Card>
  )
}
