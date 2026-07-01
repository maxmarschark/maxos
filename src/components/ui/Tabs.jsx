import { cn } from "../../lib/cn"

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={cn("border-b border-zinc-800", className)}>
      <nav className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              )}
            >
              {tab.label}
              {tab.count != null && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
                    isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-zinc-800 text-zinc-500"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
