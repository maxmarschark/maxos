export function ViewAllToggle({ expanded, total, limit, onToggle }) {
  if (total <= limit) return null

  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
    >
      {expanded ? "Show Less" : `View All (${total})`}
    </button>
  )
}
