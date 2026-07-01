import { useCallback, useEffect, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { ACCOUNTS_STORAGE_KEY, EMPTY_ACCOUNT } from "./constants"
import { SEED_ACCOUNTS } from "./seed"
import { AccountsContext } from "./accounts-context"

function loadAccounts() {
  return loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS)
}

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState(loadAccounts)

  useEffect(() => {
    saveToStorage(ACCOUNTS_STORAGE_KEY, accounts)
  }, [accounts])

  const getAccount = useCallback(
    (id) => accounts.find((a) => a.id === id),
    [accounts]
  )

  const addAccount = useCallback((data) => {
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
    setAccounts((prev) => [account, ...prev])
    return account
  }, [])

  const updateAccount = useCallback((id, data) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, ...data, updatedAt: new Date().toISOString() }
          : a
      )
    )
  }, [])

  const deleteAccount = useCallback((id) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const addNote = useCallback((accountId, content) => {
    const note = {
      id: generateId(),
      content,
      createdAt: new Date().toISOString(),
    }
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? {
              ...a,
              notes: [note, ...a.notes],
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    )
  }, [])

  const deleteNote = useCallback((accountId, noteId) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? {
              ...a,
              notes: a.notes.filter((n) => n.id !== noteId),
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    )
  }, [])

  const addTask = useCallback((accountId, title, dueDate) => {
    const task = {
      id: generateId(),
      title,
      done: false,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    }
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? {
              ...a,
              tasks: [...a.tasks, task],
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    )
  }, [])

  const toggleTask = useCallback((accountId, taskId) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? {
              ...a,
              tasks: a.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t
              ),
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    )
  }, [])

  const deleteTask = useCallback((accountId, taskId) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? {
              ...a,
              tasks: a.tasks.filter((t) => t.id !== taskId),
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    )
  }, [])

  const value = {
    accounts,
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
