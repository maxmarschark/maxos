import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"
import { cn } from "../../lib/cn"
import { useClickOutside } from "../../hooks/useClickOutside"
import { useAuth } from "../../features/auth/useAuth"
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserEmail,
  getUserInitial,
} from "../../lib/supabase/auth"

export function UserMenu() {
  const navigate = useNavigate()
  const { user, signOut, configured } = useAuth()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const displayName = getUserDisplayName(user)
  const email = getUserEmail(user)
  const initial = getUserInitial(user)
  const avatarUrl = getUserAvatarUrl(user)

  async function handleSignOut() {
    setSigningOut(true)
    setOpen(false)
    await signOut()
    setSigningOut(false)
  }

  function handleSettings() {
    setOpen(false)
    navigate("/settings")
  }

  if (!configured || !user) {
    return (
      <div className="flex h-9 items-center rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-500">
        Local mode
      </div>
    )
  }

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
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {initial}
          </div>
        )}
        <span className="hidden max-w-[120px] truncate font-medium text-zinc-300 md:inline">
          {displayName}
        </span>
        <ChevronDown
          size={14}
          className={cn("text-zinc-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl shadow-black/40"
        >
          <div className="border-b border-zinc-800 px-3 py-2.5">
            <div className="truncate text-sm font-medium text-zinc-200">{displayName}</div>
            <div className="truncate text-xs text-zinc-500">{email}</div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <User size={15} strokeWidth={1.75} />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleSettings}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Settings size={15} strokeWidth={1.75} />
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            <LogOut size={15} strokeWidth={1.75} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  )
}
