import { cn } from "../../lib/cn"

export function SectionHeader({ title, description, action, className }) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-zinc-100">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
