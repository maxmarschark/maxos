import { useCallback, useEffect, useMemo, useState } from "react"
import { isSupabaseConfigured } from "../../lib/supabase/env"
import { getSupabaseClient } from "../../lib/supabase/client"
import {
  bootstrapAuthSession,
  signInWithGoogle as googleSignIn,
  signOut as supabaseSignOut,
} from "../../lib/supabase/auth"
import { AuthContext } from "./auth-context"

export function AuthProvider({ children }) {
  const configured = isSupabaseConfigured()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(() => configured && Boolean(getSupabaseClient()))

  useEffect(() => {
    if (!configured) {
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return
    }

    let cancelled = false

    async function initAuth() {
      try {
        const { session: initialSession, error } = await bootstrapAuthSession()
        if (cancelled) return

        if (error) {
          console.warn("[Max OS Auth] OAuth bootstrap failed:", error)
        }

        if (initialSession) {
          setSession(initialSession)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return
      setSession(nextSession)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [configured])

  const signInWithGoogle = useCallback(async () => {
    return googleSignIn()
  }, [])

  const signOut = useCallback(async () => {
    const result = await supabaseSignOut()
    if (result.ok) {
      setSession(null)
    }
    return result
  }, [])

  const value = useMemo(
    () => ({
      configured,
      session,
      user: session?.user ?? null,
      loading,
      signInWithGoogle,
      signOut,
    }),
    [configured, session, loading, signInWithGoogle, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
