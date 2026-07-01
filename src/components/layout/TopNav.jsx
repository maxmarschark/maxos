import { Menu, Sparkles } from "lucide-react"
import { useMatches } from "react-router-dom"
import { getRouteByPath } from "../../config/routes"
import { Button } from "../ui/Button"
import { SearchInput } from "../ui/SearchInput"
import { UserMenu } from "./UserMenu"
import { cn } from "../../lib/cn"

export function TopNav({ onOpenSearch, onOpenMobile, onBuildDay, isBuilding = false }) {
  const matches = useMatches()
  const handle = matches.at(-1)?.handle
  const title = handle?.title ?? "Max OS"
  const description = handle?.description

  const leafPath = matches.at(-1)?.pathname ?? "/"
  const basePath =
    leafPath === "/"
      ? "/"
      : `/${leafPath.split("/").filter(Boolean)[0]}`
  const routeConfig = getRouteByPath(basePath)
  const RouteIcon = routeConfig.icon

  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-zinc-800/80 bg-zinc-950/90 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="hidden min-w-0 shrink-0 items-center gap-2.5 sm:flex">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800/80 bg-zinc-900/50",
            "text-indigo-400"
          )}
        >
          <RouteIcon size={16} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-zinc-100">{title}</h1>
          {description && (
            <p className="truncate text-[11px] text-zinc-600">{description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:justify-center sm:px-4">
        <SearchInput
          className="w-full max-w-md"
          placeholder="Search accounts, orders, contacts..."
          onFocus={onOpenSearch}
          readOnly
        />
        <kbd className="pointer-events-none hidden shrink-0 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 lg:inline">
          {isMac ? "⌘K" : "Ctrl+K"}
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={Sparkles}
          onClick={onBuildDay}
          loading={isBuilding}
          disabled={isBuilding}
          className="hidden sm:inline-flex"
        >
          {isBuilding ? "Building…" : "Build My Day"}
        </Button>
        <Button
          variant="primary"
          size="icon"
          icon={Sparkles}
          onClick={onBuildDay}
          loading={isBuilding}
          disabled={isBuilding}
          className="sm:hidden"
          aria-label={isBuilding ? "Building plan" : "Build My Day"}
        />
        <UserMenu />
      </div>
    </header>
  )
}
