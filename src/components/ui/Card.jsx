import { cn } from "../../lib/cn"

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
}

export function Card({ children, className, padding = "md", ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800/80 bg-zinc-900/30",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div>
        {title && (
          <div className="text-sm font-semibold text-zinc-100">{title}</div>
        )}
        {description && (
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div
      className={cn(
        "mt-4 flex items-center gap-2 border-t border-zinc-800/60 pt-4",
        className
      )}
    >
      {children}
    </div>
  )
}
