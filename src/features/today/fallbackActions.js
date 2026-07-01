export const FALLBACK_ACTIONS = [
  {
    priority: 4,
    sort: 0,
    label: "Review open tasks",
    detail: "Check overdue and due-today items",
    link: "/tasks",
  },
  {
    priority: 2,
    sort: 0,
    label: "Follow up with key accounts",
    detail: "Review account follow-up dates",
    link: "/accounts",
  },
  {
    priority: 4,
    sort: 0,
    label: "Update CRM notes",
    detail: "Log recent visits and conversations",
    link: "/contacts",
  },
]

export function applyFallbackActions(actions) {
  if (actions.length >= 3) return actions

  const existingLabels = new Set(actions.map((a) => a.label))
  const fallbacks = FALLBACK_ACTIONS.filter((f) => !existingLabels.has(f.label))
  const needed = 3 - actions.length
  const merged = [...actions, ...fallbacks.slice(0, needed)]

  return merged.map((action, index) => ({ ...action, order: index + 1 }))
}
