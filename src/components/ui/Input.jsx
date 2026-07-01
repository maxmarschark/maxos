import { cn } from "../../lib/cn"

export function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border bg-zinc-900/50 px-3 text-sm text-zinc-100",
        "placeholder:text-zinc-600 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-red-500/50 focus:ring-red-500/40"
          : "border-zinc-800 hover:border-zinc-700",
        className
      )}
      {...props}
    />
  )
}
