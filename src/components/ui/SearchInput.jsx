import { Search } from "lucide-react"
import { cn } from "../../lib/cn"

export function SearchInput({ className, onFocus, placeholder = "Search...", ...props }) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
      />
      <input
        type="search"
        placeholder={placeholder}
        onFocus={onFocus}
        className={cn(
          "h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/50",
          "pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600",
          "transition-colors hover:border-zinc-700",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50"
        )}
        {...props}
      />
    </div>
  )
}
