import { useState } from "react"
import { CheckCircle2, Circle, Pencil, Plus, Trash2 } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { Button } from "../../../../components/ui/Button"
import { Badge } from "../../../../components/ui/Badge"
import { EmptyState } from "../../../../components/ui/EmptyState"
import { formatDate } from "../../../../lib/format"
import { cn } from "../../../../lib/cn"
import { useTasks } from "../../../tasks/useTasks"
import { TaskFormModal } from "../../../tasks/components/TaskFormModal"
import { DeleteTaskModal } from "../../../tasks/components/DeleteTaskModal"
import { CreateFollowUpButton } from "../../../tasks/components/CreateFollowUpButton"
import { PRIORITY_VARIANTS, STATUS_VARIANTS } from "../../../tasks/constants"
import { buildFollowUpFromAccount } from "../../../tasks/utils"
import { getTodayISO } from "../../../today/utils"

export function TasksTab({ account, accounts, contacts, brands, orders }) {
  const { getTasksByAccount, addTask, updateTask, deleteTask, markComplete } = useTasks()
  const accountTasks = getTasksByAccount(account.id)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)

  const pending = accountTasks.filter((t) => t.status !== "Complete")
  const completed = accountTasks.filter((t) => t.status === "Complete")

  return (
    <div className="space-y-4">
      <Card padding="md" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <CreateFollowUpButton
          label="Schedule Follow-up"
          initialValues={buildFollowUpFromAccount(account, getTodayISO())}
          accounts={accounts}
          contacts={contacts}
          brands={brands}
          orders={orders}
          onCreate={(data) => addTask(data)}
        />
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setFormOpen(true)}>
          Add Task
        </Button>
      </Card>

      {accountTasks.length === 0 ? (
        <Card padding="none">
          <EmptyState
            title="No tasks yet"
            description="Create tasks to track follow-ups and action items for this account."
            actionLabel="Add Task"
            onAction={() => setFormOpen(true)}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Open ({pending.length})
              </h4>
              {pending.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => markComplete(task.id)}
                  onEdit={() => {
                    setEditingTask(task)
                    setFormOpen(true)
                  }}
                  onDelete={() => setDeletingTask(task)}
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
                  onToggle={() => {}}
                  onEdit={() => {
                    setEditingTask(task)
                    setFormOpen(true)
                  }}
                  onDelete={() => setDeletingTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <TaskFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTask(null)
        }}
        onSubmit={(data) => {
          if (editingTask) {
            updateTask(editingTask.id, data)
          } else {
            addTask({ ...data, accountId: account.id })
          }
        }}
        task={editingTask}
        initialValues={editingTask ? undefined : { accountId: account.id }}
        accounts={accounts}
        contacts={contacts}
        brands={brands}
        orders={orders}
      />

      <DeleteTaskModal
        open={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => deleteTask(deletingTask.id)}
        taskTitle={deletingTask?.title ?? ""}
      />
    </div>
  )
}

function TaskRow({ task, onToggle, onEdit, onDelete }) {
  return (
    <Card
      padding="sm"
      className={cn("group flex items-center gap-3", task.status === "Complete" && "opacity-60")}
    >
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 text-zinc-600 transition-colors hover:text-indigo-400"
        disabled={task.status === "Complete"}
      >
        {task.status === "Complete" ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Circle size={18} />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm text-zinc-200",
            task.status === "Complete" && "line-through text-zinc-500"
          )}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {task.dueDate && (
            <span className="text-xs text-zinc-600">Due {formatDate(task.dueDate)}</span>
          )}
          <Badge variant={PRIORITY_VARIANTS[task.priority]} className="text-[10px] normal-case tracking-normal">
            {task.priority}
          </Badge>
          <Badge variant={STATUS_VARIANTS[task.status]} className="text-[10px] normal-case tracking-normal">
            {task.status}
          </Badge>
        </div>
      </div>
      <Button variant="ghost" size="icon" icon={Pencil} aria-label="Edit" onClick={onEdit} />
      <Button
        variant="ghost"
        size="icon"
        icon={Trash2}
        aria-label="Delete"
        className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
        onClick={onDelete}
      />
    </Card>
  )
}
