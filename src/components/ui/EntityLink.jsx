import { Link } from "react-router-dom"
import { cn } from "../../lib/cn"

export function EntityLink({ to, children, className, onClick }) {
  if (!to) {
    return <span className={cn("text-zinc-400", className)}>{children ?? "—"}</span>
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "text-left text-indigo-400 transition-colors hover:text-indigo-300",
          className
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn("text-indigo-400 transition-colors hover:text-indigo-300", className)}
    >
      {children}
    </Link>
  )
}

export function EntityLinks({ items, className }) {
  const valid = items.filter((item) => item.label)
  if (valid.length === 0) return <span className="text-zinc-500">—</span>

  return (
    <span className={cn("flex flex-wrap items-center gap-1", className)}>
      {valid.map((item, index) => (
        <span key={item.key ?? item.to ?? item.label} className="inline-flex items-center gap-1">
          {index > 0 && <span className="text-zinc-600">·</span>}
          <EntityLink to={item.to}>{item.label}</EntityLink>
        </span>
      ))}
    </span>
  )
}
