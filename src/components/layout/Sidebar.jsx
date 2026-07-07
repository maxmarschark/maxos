import { Link, NavLink } from "react-router-dom"
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react"
import { navRoutes } from "../../config/routes"
import { cn } from "../../lib/cn"
import { Button } from "../ui/Button"

export function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }) {
  const content = (
    <>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-zinc-800/80",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {!collapsed && (
          <Link
            to="/"
            onClick={onCloseMobile}
            className="group flex cursor-pointer items-center gap-2.5 rounded-md transition-opacity duration-150 hover:opacity-90"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white transition-colors duration-150 group-hover:bg-indigo-500">
              M
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 transition-colors duration-150 group-hover:text-white">
                Max OS
              </div>
              <div className="text-[10px] text-zinc-600 transition-colors duration-150 group-hover:text-zinc-500">
                Sales OS
              </div>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link
            to="/"
            onClick={onCloseMobile}
            className="group flex cursor-pointer items-center justify-center rounded-md transition-opacity duration-150 hover:opacity-90"
            title="Max OS"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white transition-colors duration-150 group-hover:bg-indigo-500">
              M
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navRoutes.map((route) => {
          const Icon = route.icon
          return (
            <NavLink
              key={route.id}
              to={route.path}
              end={route.path === "/"}
              onClick={onCloseMobile}
              title={collapsed ? route.name : undefined}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center rounded-lg text-[13px] font-medium transition-colors",
                  collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-2.5 py-2",
                  isActive
                    ? "bg-indigo-950/50 text-indigo-100 ring-1 ring-inset ring-indigo-800/50"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-indigo-500" />
                  )}
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    className={isActive ? "text-indigo-400" : undefined}
                  />
                  {!collapsed && <span>{route.name}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="hidden border-t border-zinc-800/80 p-2 lg:block">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "md"}
          className={cn("w-full", collapsed && "justify-center")}
          icon={collapsed ? PanelLeftOpen : PanelLeftClose}
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!collapsed && "Collapse"}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-800/80 bg-zinc-950 transition-all duration-200",
          "lg:static lg:z-auto",
          collapsed ? "w-[68px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {content}
      </aside>
    </>
  )
}
