import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import { commandActions } from "../../config/commands"

export function CommandPalette({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null
  return <CommandPalettePanel onClose={onClose} onSelect={onSelect} />
}

function CommandPalettePanel({ onClose, onSelect }) {
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return commandActions
    const q = query.toLowerCase()
    return commandActions.filter((action) =>
      action.label.toLowerCase().includes(q)
    )
  }, [query])

  const groups = useMemo(() => {
    const map = new Map()
    for (const action of filtered) {
      if (!map.has(action.group)) map.set(action.group, [])
      map.get(action.group).push(action)
    }
    return map
  }, [filtered])

  const flatItems = filtered

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  function handleQueryChange(event) {
    setQuery(event.target.value)
    setActiveIndex(0)
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === "Enter" && flatItems[activeIndex]) {
      event.preventDefault()
      onSelect(flatItems[activeIndex])
      onClose()
    }
  }

  let itemIndex = -1

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
          <Search size={16} className="shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="h-12 w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {flatItems.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-zinc-500">
              No commands found
            </div>
          ) : (
            [...groups.entries()].map(([group, actions]) => (
              <div key={group} className="mb-1">
                <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                  {group}
                </div>
                {actions.map((action) => {
                  itemIndex += 1
                  const idx = itemIndex
                  const Icon = action.icon
                  const isActive = idx === activeIndex

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => {
                        onSelect(action)
                        onClose()
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-indigo-600/20 text-zinc-100"
                          : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
