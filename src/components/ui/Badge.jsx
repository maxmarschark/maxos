import { cn } from "../../lib/cn"

const variants = {
  default: "bg-zinc-800/60 text-zinc-400 border-zinc-700/50",
  primary: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  danger: "bg-red-500/10 text-red-300 border-red-500/20",
}

export function Badge({ children, variant = "default", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5",
        "text-[11px] font-medium uppercase tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
