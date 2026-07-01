import { Calendar, Circle } from "lucide-react"
import { Card, CardHeader } from "../../../components/ui/Card"
import { Badge } from "../../../components/ui/Badge"
import { formatDate } from "../../../lib/format"

function ScheduleGroup({ title, items, emptyText, onToggleTask }) {
  if (items.length === 0) {
    return (
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-600">{title}</p>
        <p className="text-sm text-zinc-600">{emptyText}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-600">{title}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/50 px-3.5 py-3"
          >
            {item.type === "task" && onToggleTask ? (
              <button
                type="button"
                className="mt-0.5 shrink-0 text-zinc-600 hover:text-indigo-400"
                onClick={() => onToggleTask(item.accountId, item.taskId)}
              >
                <Circle size={18} />
              </button>
            ) : (
              <Calendar size={16} className="mt-0.5 shrink-0 text-zinc-600" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-zinc-200">{item.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{item.subtitle}</p>
              {item.date && (
                <p className="mt-0.5 text-xs text-zinc-600">{formatDate(item.date)}</p>
              )}
            </div>
            {item.overdue && (
              <Badge variant="danger" className="shrink-0">
                Overdue
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ScheduleSection({ schedule, onToggleTask }) {
  const total =
    schedule.tasks.length + schedule.meetings.length + schedule.followUps.length

  return (
    <Card padding="md">
      <CardHeader
        title="Today's Schedule"
        description={`${total} item${total !== 1 ? "s" : ""} on your calendar`}
      />
      <div className="space-y-5">
        <ScheduleGroup
          title="Tasks Due"
          items={schedule.tasks}
          emptyText="No tasks due today."
          onToggleTask={onToggleTask}
        />
        <ScheduleGroup
          title="Meetings & Visits"
          items={schedule.meetings}
          emptyText="No meetings scheduled today."
        />
        <ScheduleGroup
          title="Follow-ups"
          items={schedule.followUps.map((f) => ({
            id: f.id,
            title: f.title,
            subtitle: `${f.subtitle} · ${f.method}`,
          }))}
          emptyText="No follow-ups scheduled today."
        />
      </div>
    </Card>
  )
}
