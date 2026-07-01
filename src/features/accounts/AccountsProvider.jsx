import { useCallback, useEffect, useRef, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { isSupabaseConfigured } from "../../lib/supabase/env"
import { ACCOUNTS_STORAGE_KEY, EMPTY_ACCOUNT } from "./constants"
import { SEED_ACCOUNTS } from "./seed"
import { AccountsContext } from "./accounts-context"

function loadLocalAccounts() {
  return loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS)
}

function loadCloudApi() {
  return import("./accountsSupabase")
}

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState(loadLocalAccounts)
  const [storageMode, setStorageMode] = useState("local")
  const storageModeRef = useRef("local")

  const setMode = useCallback((mode) => {
    storageModeRef.current = mode
    setStorageMode(mode)
  }, [])

  const fallBackToLocal = useCallback(() => {
    console.warn("[Max OS Accounts] LOCAL — falling back to localStorage")
    setMode("local")
  }, [setMode])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!isSupabaseConfigured()) {
        console.info("[Max OS Accounts] LOCAL — Supabase env vars not configured")
        return
      }

      const { initCloudAccounts } = await loadCloudApi()
      const result = await initCloudAccounts()
      if (cancelled) return

      if (result.ok) {
        setAccounts(result.accounts)
        setMode("cloud")
        return
      }

      console.info(
        "[Max OS Accounts] LOCAL — using localStorage fallback",
        result.reason ? `(${result.reason})` : ""
      )
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [setMode])

  useEffect(() => {
    saveToStorage(ACCOUNTS_STORAGE_KEY, accounts)
  }, [accounts])

  const syncAccountToCloud = useCallback(
    async (account) => {
      if (storageModeRef.current !== "cloud") return true
      const { updateCloudAccount } = await loadCloudApi()
      const result = await updateCloudAccount(account)
      if (!result.ok) {
        console.error("[Max OS Accounts] Cloud update failed:", result.error)
        fallBackToLocal()
        return false
      }
      return true
    },
    [fallBackToLocal]
  )

  const getAccount = useCallback(
    (id) => accounts.find((a) => a.id === id),
    [accounts]
  )

  const addAccount = useCallback(
    async (data) => {
      const now = new Date().toISOString()
      const account = {
        ...EMPTY_ACCOUNT,
        ...data,
        id: generateId(),
        notes: [],
        tasks: [],
        createdAt: now,
        updatedAt: now,
      }

      if (storageModeRef.current === "cloud") {
        const { insertCloudAccount } = await loadCloudApi()
        const result = await insertCloudAccount(account)
        if (result.ok) {
          setAccounts((prev) => [result.account, ...prev])
          return result.account
        }
        console.error("[Max OS Accounts] Cloud insert failed:", result.error)
        fallBackToLocal()
      }

      setAccounts((prev) => [account, ...prev])
      return account
    },
    [fallBackToLocal]
  )

  const updateAccount = useCallback(
    (id, data) => {
      const now = new Date().toISOString()
      let updatedAccount = null

      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a
          updatedAccount = { ...a, ...data, updatedAt: now }
          return updatedAccount
        })
      )

      if (updatedAccount) {
        void syncAccountToCloud(updatedAccount)
      }
    },
    [syncAccountToCloud]
  )

  const deleteAccount = useCallback(
    async (id) => {
      if (storageModeRef.current === "cloud") {
        const { deleteCloudAccount } = await loadCloudApi()
        const result = await deleteCloudAccount(id)
        if (!result.ok) {
          console.error("[Max OS Accounts] Cloud delete failed:", result.error)
          fallBackToLocal()
        }
      }
      setAccounts((prev) => prev.filter((a) => a.id !== id))
    },
    [fallBackToLocal]
  )

  const mutateAccount = useCallback(
    (accountId, updater) => {
      let updatedAccount = null

      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id !== accountId) return a
          updatedAccount = updater(a)
          return updatedAccount
        })
      )

      if (updatedAccount) {
        void syncAccountToCloud(updatedAccount)
      }
    },
    [syncAccountToCloud]
  )

  const addNote = useCallback(
    (accountId, content) => {
      const note = {
        id: generateId(),
        content,
        createdAt: new Date().toISOString(),
      }
      mutateAccount(accountId, (a) => ({
        ...a,
        notes: [note, ...a.notes],
        updatedAt: new Date().toISOString(),
      }))
    },
    [mutateAccount]
  )

  const deleteNote = useCallback(
    (accountId, noteId) => {
      mutateAccount(accountId, (a) => ({
        ...a,
        notes: a.notes.filter((n) => n.id !== noteId),
        updatedAt: new Date().toISOString(),
      }))
    },
    [mutateAccount]
  )

  const addTask = useCallback(
    (accountId, title, dueDate) => {
      const task = {
        id: generateId(),
        title,
        done: false,
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
      }
      mutateAccount(accountId, (a) => ({
        ...a,
        tasks: [...a.tasks, task],
        updatedAt: new Date().toISOString(),
      }))
    },
    [mutateAccount]
  )

  const toggleTask = useCallback(
    (accountId, taskId) => {
      mutateAccount(accountId, (a) => ({
        ...a,
        tasks: a.tasks.map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t
        ),
        updatedAt: new Date().toISOString(),
      }))
    },
    [mutateAccount]
  )

  const deleteTask = useCallback(
    (accountId, taskId) => {
      mutateAccount(accountId, (a) => ({
        ...a,
        tasks: a.tasks.filter((t) => t.id !== taskId),
        updatedAt: new Date().toISOString(),
      }))
    },
    [mutateAccount]
  )

  const value = {
    accounts,
    storageMode,
    getAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    addNote,
    deleteNote,
    addTask,
    toggleTask,
    deleteTask,
  }

  return (
    <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>
  )
}
