import { filterEventsOnDate, formatDisplayTime, formatEventTimeRange, timeToMinutes } from "../calendar/utils"
import { compareTaskPriority, flattenTasksForToday, getTaskLink } from "../tasks/utils"

function formatTaskDetail(task) {
  const parts = []
  if (task.linkLabel) parts.push(task.linkLabel)
  if (task.type) parts.push(task.type)
  if (task.priority) parts.push(task.priority)
  return parts.join(" · ")
}

export function buildTodayAgenda({ calendarEvents, tasks, tasksDueFlat, todayISO }) {
  const eventsToday = filterEventsOnDate(calendarEvents, todayISO)
  const taskList = tasksDueFlat ?? flattenTasksForToday(tasks, todayISO)

  const timed = []
  const flexible = []

  for (const event of eventsToday) {
    timed.push({
      kind: "calendar",
      id: `cal-${event.id}`,
      sortMinutes: event.allDay ? -1 : timeToMinutes(event.eventTime),
      allDay: Boolean(event.allDay),
      event,
    })
  }

  for (const task of taskList) {
    if (task.dueTime) {
      timed.push({
        kind: "task",
        id: `task-${task.id}`,
        sortMinutes: timeToMinutes(task.dueTime),
        allDay: false,
        task,
      })
    } else {
      flexible.push({
        kind: "task",
        id: `task-${task.id}`,
        task,
      })
    }
  }

  timed.sort((a, b) => {
    if (a.allDay && !b.allDay) return -1
    if (!a.allDay && b.allDay) return 1
    if (a.sortMinutes !== b.sortMinutes) return a.sortMinutes - b.sortMinutes
    if (a.kind !== b.kind) return a.kind === "calendar" ? -1 : 1
    return 0
  })

  flexible.sort((a, b) => compareTaskPriority(a.task, b.task))

  return {
    timed,
    flexible,
    totalCount: timed.length + flexible.length,
    taskIds: new Set(taskList.map((task) => task.id)),
  }
}

export function formatAgendaTime(item) {
  if (item.kind === "calendar") {
    if (item.event.allDay) return "All day"
    if (item.event.eventTime) return formatDisplayTime(item.event.eventTime)
    return "—"
  }
  if (item.task.dueTime) return formatDisplayTime(item.task.dueTime)
  return "—"
}

export function agendaItemToBuildAction(item) {
  if (item.kind === "calendar") {
    const event = item.event
    const sourceLabel = event.source === "google" ? "Google" : "Max OS"
    return {
      priority: 0,
      sort: item.sortMinutes,
      label: event.title,
      detail: `${formatEventTimeRange(event)} · ${sourceLabel} calendar`,
      link: event.source === "google" && event.htmlLink ? event.htmlLink : "/calendar",
      calendarBlock: true,
      agendaItem: true,
      externalLink: Boolean(event.source === "google" && event.htmlLink),
      eventSource: event.source,
    }
  }

  const task = item.task
  return {
    priority: 0,
    sort: item.sortMinutes,
    label: task.title,
    detail: formatTaskDetail(task) || "Task",
    link: getTaskLink(task),
    taskId: task.id,
    agendaItem: true,
    timedTask: true,
  }
}

export function flexibleAgendaItemToBuildAction(item) {
  const task = item.task
  return {
    priority: 3,
    sort: (task.overdue ? 100 : 0) + (task.priority === "Urgent" ? 50 : 0),
    label: task.title,
    detail: formatTaskDetail(task) || "Flexible task",
    link: getTaskLink(task),
    taskId: task.id,
    agendaItem: true,
    flexibleTask: true,
  }
}
