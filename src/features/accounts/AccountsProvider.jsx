import { useCallback, useEffect, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import {
  persistCloudDelete,
  persistCloudInsert,
  persistCloudUpdate,
} from "../../lib/supabase/cloudPersist"
import { useAuthReady } from "../auth/useAuthReady"
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
  const authReady = useAuthReady()
  const [accounts, setAccounts] = useState(loadLocalAccounts)

  const initCloud = useCallback(
    () => loadCloudApi().then(({ initCloudAccounts }) => initCloudAccounts()),
    []
  )
  const onCloudLoaded = useCallback((result) => {
    setAccounts(result.accounts)
  }, [])

  const { storageMode, storageModeRef, fallBackToLocal } = useCloudBootstrap({
    moduleName: "Accounts",
    initCloud,
    onCloudLoaded,
    authReady,
  })

  useEffect(() => {
    saveToStorage(ACCOUNTS_STORAGE_KEY, accounts)
  }, [accounts])

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

      const { insertCloudAccount } = await loadCloudApi()
      const persisted = await persistCloudInsert({
        storageModeRef,
        fallBackToLocal,
        insert: insertCloudAccount,
        entity: account,
        label: "Accounts",
      })

      if (!persisted.ok) return null
      setAccounts((prev) => [persisted.entity, ...prev])
      return persisted.entity
    },
    [fallBackToLocal]
  )

  const updateAccount = useCallback(
    async (id, data) => {
      const existing = accounts.find((a) => a.id === id)
      if (!existing) return false

      const updatedAccount = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      }

      const { updateCloudAccount } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        fallBackToLocal,
        update: updateCloudAccount,
        entity: updatedAccount,
        label: "Accounts",
      })

      if (!persisted.ok) return false
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? persisted.entity : a))
      )
      return true
    },
    [accounts, fallBackToLocal]
  )

  const deleteAccount = useCallback(
    async (id) => {
      const { deleteCloudAccount } = await loadCloudApi()
      const persisted = await persistCloudDelete({
        storageModeRef,
        fallBackToLocal,
        remove: deleteCloudAccount,
        id,
        label: "Accounts",
      })

      if (!persisted.ok) return false
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      return true
    },
    [fallBackToLocal]
  )

  const mutateAccount = useCallback(
    async (accountId, updater) => {
      const existing = accounts.find((a) => a.id === accountId)
      if (!existing) return false

      const updatedAccount = updater(existing)
      const { updateCloudAccount } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        fallBackToLocal,
        update: updateCloudAccount,
        entity: updatedAccount,
        label: "Accounts",
      })

      if (!persisted.ok) return false
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? persisted.entity : a))
      )
      return true
    },
    [accounts, fallBackToLocal]
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
