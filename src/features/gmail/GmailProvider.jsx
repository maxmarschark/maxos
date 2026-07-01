import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchGmailInbox } from "../../lib/google/gmailApi"
import {
  connectGoogleGmail as requestGmailAccess,
  getGoogleAccessToken,
  resolveGmailStatus,
} from "../../lib/supabase/auth"
import { isGmailEnabled } from "../../config/featureFlags"
import { saveGoogleWorkspaceOptIn } from "../google-workspace/optIn"
import { useAuth } from "../auth/useAuth"
import { GMAIL_OPT_IN_KEY, GMAIL_STATUS } from "./constants"
import { GmailContext } from "./gmail-context"

function loadOptIn() {
  try {
    return localStorage.getItem(GMAIL_OPT_IN_KEY) === "true"
  } catch {
    return false
  }
}

function saveOptIn(value) {
  try {
    localStorage.setItem(GMAIL_OPT_IN_KEY, value ? "true" : "false")
  } catch {
    /* ignore */
  }
}

export function GmailProvider({ children }) {
  if (!isGmailEnabled()) {
    return children
  }

  return <GmailProviderInner>{children}</GmailProviderInner>
}

function GmailProviderInner({ children }) {
  const { user, configured } = useAuth()
  const [optIn, setOptIn] = useState(loadOptIn)
  const [emails, setEmails] = useState([])
  const [importantEmails, setImportantEmails] = useState([])
  const [status, setStatus] = useState(GMAIL_STATUS.NOT_CONNECTED)
  const [loading, setLoading] = useState(false)
  const [lastFetchedAt, setLastFetchedAt] = useState(null)
  const [error, setError] = useState(null)

  const syncStatus = useCallback(async () => {
    if (!configured || !user) {
      setStatus(GMAIL_STATUS.NOT_CONNECTED)
      return
    }

    const resolved = await resolveGmailStatus({ optIn })
    setStatus(resolved.status)
  }, [configured, user, optIn])

  const refreshInbox = useCallback(async () => {
    if (!configured || !user) {
      setStatus(GMAIL_STATUS.NOT_CONNECTED)
      setEmails([])
      setImportantEmails([])
      return { ok: false, reason: "not_signed_in" }
    }

    setLoading(true)
    setError(null)

    const resolved = await resolveGmailStatus({ optIn })
    setStatus(resolved.status)

    if (resolved.status !== GMAIL_STATUS.CONNECTED) {
      setLoading(false)
      setEmails([])
      setImportantEmails([])
      if (resolved.status === GMAIL_STATUS.PERMISSION_NEEDED) {
        return { ok: false, reason: "permission_needed" }
      }
      return { ok: false, reason: "no_token" }
    }

    const token = await getGoogleAccessToken()
    const result = await fetchGmailInbox(token)

    setLoading(false)

    if (!result.ok) {
      setEmails([])
      setImportantEmails([])
      setError(result.error ?? "Failed to load Gmail inbox")
      setStatus(
        result.reason === "permission_needed"
          ? GMAIL_STATUS.PERMISSION_NEEDED
          : GMAIL_STATUS.NOT_CONNECTED
      )
      return result
    }

    setEmails(result.emails)
    setImportantEmails(result.importantEmails)
    setLastFetchedAt(new Date().toISOString())
    setStatus(GMAIL_STATUS.CONNECTED)
    return result
  }, [configured, user, optIn])

  const connect = useCallback(async () => {
    saveOptIn(true)
    setOptIn(true)
    saveGoogleWorkspaceOptIn()
    const result = await requestGmailAccess()
    if (!result.ok) {
      setError(result.error ?? "Could not start Gmail authorization")
    }
    return result
  }, [])

  useEffect(() => {
    let cancelled = false

    async function syncGmail() {
      if (!configured || !user) {
        if (!cancelled) {
          setEmails([])
          setImportantEmails([])
          setStatus(GMAIL_STATUS.NOT_CONNECTED)
        }
        return
      }

      if (optIn) {
        await refreshInbox()
      } else if (!cancelled) {
        await syncStatus()
      }
    }

    void syncGmail()
    return () => {
      cancelled = true
    }
  }, [configured, user, optIn, refreshInbox, syncStatus])

  const value = useMemo(
    () => ({
      emails,
      importantEmails,
      status,
      loading,
      lastFetchedAt,
      error,
      optIn,
      refreshInbox,
      connect,
    }),
    [emails, importantEmails, status, loading, lastFetchedAt, error, optIn, refreshInbox, connect]
  )

  return <GmailContext.Provider value={value}>{children}</GmailContext.Provider>
}
