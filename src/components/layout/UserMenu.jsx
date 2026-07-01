import { useRef, useState } from "react"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"
import { cn } from "../../lib/cn"
import { useClickOutside } from "../../hooks/useClickOutside"

const menuItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "signout", label: "Sign out", icon: LogOut, danger: true },
]

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50",
          "px-2 py-1.5 text-sm transition-colors hover:border-zinc-700 hover:bg-zinc-800/50",
          open && "border-zinc-700 bg-zinc-800/50"
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          M
        </div>
        <span className="hidden font-medium text-zinc-300 md:inline">Max</span>
        <ChevronDown
          size={14}
          className={cn("text-zinc-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl shadow-black/40">
          <div className="border-b border-zinc-800 px-3 py-2.5">
            <div className="text-sm font-medium text-zinc-200">Max Broker</div>
            <div className="text-xs text-zinc-500">max@maxos.io</div>
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                  item.danger
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                )}
              >
                <Icon size={15} strokeWidth={1.75} />
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
