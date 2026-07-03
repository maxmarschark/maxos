import { useAuth } from "./useAuth"
import { LoginPage } from "../../pages/LoginPage"
import { hasOAuthCallbackInUrl } from "../../lib/supabase/auth"

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    </div>
  )
}

export function AuthGate({ children }) {
  const { configured, session, loading } = useAuth()

  if (!configured) {
    return children
  }

  if (loading || (!session && hasOAuthCallbackInUrl())) {
    return <AuthLoadingScreen />
  }

  if (!session) {
    return <LoginPage />
  }

  return children
}
