import { useCallback, useEffect, useMemo, useState } from "react"
import { getSupabaseEnvStatus } from "../../lib/supabase/env"
import { getSupabaseClient } from "../../lib/supabase/client"
import { getAuthUser } from "../../lib/supabase/auth"
import { useAuth } from "../auth/useAuth"
import { CloudSyncContext } from "./cloud-sync-context"

const LAST_SYNC_KEY = "max-os-last-cloud-sync"

function loadLastSync() {
  try {
    return localStorage.getItem(LAST_SYNC_KEY)
  } catch {
    return null
  }
}

function saveLastSync(iso) {
  try {
    localStorage.setItem(LAST_SYNC_KEY, iso)
  } catch {
    /* ignore */
  }
}

function getProjectName() {
  const status = getSupabaseEnvStatus()
  if (!status.urlHost) return "—"
  return status.urlHost.replace(".supabase.co", "")
}

export function CloudSyncProvider({ children }) {
  const { user: authUser } = useAuth()
  const [connected, setConnected] = useState(false)
  const [connectedUser, setConnectedUser] = useState(null)
  const [lastSync, setLastSync] = useState(loadLastSync)
  const [checking, setChecking] = useState(true)

  const refreshStatus = useCallback(async () => {
    const env = getSupabaseEnvStatus()
    if (!env.configured) {
      setConnected(false)
      setConnectedUser(null)
      setChecking(false)
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setConnected(false)
      setConnectedUser(null)
      setChecking(false)
      return
    }

    const user = authUser ?? (await getAuthUser())
    const { error } = await supabase.from("accounts").select("id").limit(1)

    if (!error) {
      setConnected(true)
      setConnectedUser(user)
      const now = new Date().toISOString()
      setLastSync(now)
      saveLastSync(now)
    } else {
      setConnected(false)
      setConnectedUser(user)
    }
    setChecking(false)
  }, [authUser])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const env = getSupabaseEnvStatus()
      if (!env.configured) {
        if (!cancelled) {
          setConnected(false)
          setConnectedUser(null)
          setChecking(false)
        }
        return
      }

      const supabase = getSupabaseClient()
      if (!supabase) {
        if (!cancelled) {
          setConnected(false)
          setConnectedUser(null)
          setChecking(false)
        }
        return
      }

      const user = authUser ?? (await getAuthUser())
      if (cancelled) return

      const { error } = await supabase.from("accounts").select("id").limit(1)
      if (cancelled) return

      if (!error) {
        setConnected(true)
        setConnectedUser(user)
        const now = new Date().toISOString()
        setLastSync(now)
        saveLastSync(now)
      } else {
        setConnected(false)
        setConnectedUser(user)
      }
      setChecking(false)
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [authUser])

  const value = useMemo(
    () => ({
      connected,
      connectedUser,
      lastSync,
      projectName: getProjectName(),
      checking,
      refreshStatus,
      markSynced: () => {
        const now = new Date().toISOString()
        setLastSync(now)
        saveLastSync(now)
      },
    }),
    [connected, connectedUser, lastSync, checking, refreshStatus]
  )

  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>
}
