import { cn } from "../../lib/cn"

export function SectionEmpty({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-zinc-800/80 bg-zinc-950/30 px-4 py-6 text-center text-sm text-zinc-500",
        className
      )}
    >
      {children}
    </div>
  )
}
