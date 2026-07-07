import { cn } from "../../lib/cn"

export function SectionEmpty({ children, className, centered = false }) {
  const box = (
    <div
      className={cn(
        "rounded-lg border border-dashed border-zinc-800/80 bg-zinc-950/30 px-4 py-6 text-center text-sm text-zinc-500",
        className
      )}
    >
      {children}
    </div>
  )

  if (centered) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center py-2">
        <div className="w-full">{box}</div>
      </div>
    )
  }

  return box
}
