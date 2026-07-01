import { useState } from "react"
import { CheckCircle2, Circle, Trash2 } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { Button } from "../../../../components/ui/Button"
import { Input } from "../../../../components/ui/Input"
import { Badge } from "../../../../components/ui/Badge"
import { EmptyState } from "../../../../components/ui/EmptyState"
import { formatDate } from "../../../../lib/format"
import { cn } from "../../../../lib/cn"

export function TasksTab({ account, onAddTask, onToggleTask, onDeleteTask }) {
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState("")

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAddTask(trimmed, dueDate || null)
    setTitle("")
    setDueDate("")
  }

  const pending = account.tasks.filter((t) => !t.done)
  const completed = account.tasks.filter((t) => t.done)

  return (
    <div className="space-y-4">
      <Card padding="md">
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="task-title" className="text-xs font-medium text-zinc-400">
              New Task
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Follow up on payment..."
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="task-due" className="text-xs font-medium text-zinc-400">
              Due Date
            </label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
          <Button type="submit" size="md" disabled={!title.trim()}>
            Add Task
          </Button>
        </form>
      </Card>

      {account.tasks.length === 0 ? (
        <Card padding="none">
          <EmptyState
            title="No tasks yet"
            description="Create tasks to track follow-ups and action items for this account."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Pending ({pending.length})
              </h4>
              {pending.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => onToggleTask(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Completed ({completed.length})
              </h4>
              {completed.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => onToggleTask(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <Card
      padding="sm"
      className={cn("group flex items-center gap-3", task.done && "opacity-60")}
    >
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 text-zinc-600 transition-colors hover:text-indigo-400"
      >
        {task.done ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Circle size={18} />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm text-zinc-200",
            task.done && "line-through text-zinc-500"
          )}
        >
          {task.title}
        </p>
        {task.dueDate && (
          <p className="mt-0.5 text-xs text-zinc-600">Due {formatDate(task.dueDate)}</p>
        )}
      </div>
      {!task.done && task.dueDate && (
        <Badge variant="warning" className="shrink-0 normal-case tracking-normal">
          Due
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        icon={Trash2}
        aria-label="Delete task"
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
        onClick={onDelete}
      />
    </Card>
  )
}
