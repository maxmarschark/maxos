import { useCallback, useEffect, useMemo, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useAccounts } from "../accounts/useAccounts"
import { useContacts } from "../contacts/useContacts"
import { useOrders } from "../orders/useOrders"
import { BRANDS_STORAGE_KEY } from "../brands/constants"
import { SEED_BRANDS } from "../brands/seed"
import { ACCOUNTS_STORAGE_KEY } from "../accounts/constants"
import { SEED_ACCOUNTS } from "../accounts/seed"
import { TASKS_STORAGE_KEY, EMPTY_TASK } from "./constants"
import { buildSeedTasks } from "./seed"
import {
  enrichTasks,
  migrateAccountTasks,
  buildFollowUpFromContact,
  buildFollowUpFromAccount,
} from "./utils"
import { TasksContext } from "./tasks-context"

function loadInitialTasks() {
  const stored = loadFromStorage(TASKS_STORAGE_KEY, null)
  if (stored && Array.isArray(stored)) return stored

  const accounts = loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS)
  const migrated = migrateAccountTasks(accounts)
  if (migrated.length > 0) return migrated

  return buildSeedTasks()
}

export function TasksProvider({ children }) {
  const { accounts } = useAccounts()
  const { contacts } = useContacts()
  const { orders } = useOrders()

  const [tasks, setTasks] = useState(loadInitialTasks)

  useEffect(() => {
    saveToStorage(TASKS_STORAGE_KEY, tasks)
  }, [tasks])

  const refs = useMemo(() => {
    const brands = loadFromStorage(BRANDS_STORAGE_KEY, SEED_BRANDS)
    return { accounts, contacts, brands, orders }
  }, [accounts, contacts, orders])

  const enrichedTasks = useMemo(() => enrichTasks(tasks, refs), [tasks, refs])

  const getTask = useCallback((id) => enrichedTasks.find((t) => t.id === id), [enrichedTasks])

  const getTasksByAccount = useCallback(
    (accountId) => enrichedTasks.filter((t) => t.accountId === accountId),
    [enrichedTasks]
  )

  const getTasksByContact = useCallback(
    (contactId) => enrichedTasks.filter((t) => t.contactId === contactId),
    [enrichedTasks]
  )

  const addTask = useCallback((data) => {
    const now = new Date().toISOString()
    const task = {
      ...EMPTY_TASK,
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      completedAt: data.status === "Complete" ? now : null,
    }
    setTasks((prev) => [task, ...prev])
    return task
  }, [])

  const updateTask = useCallback((id, data) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const now = new Date().toISOString()
        const nextStatus = data.status ?? t.status
        return {
          ...t,
          ...data,
          updatedAt: now,
          completedAt:
            nextStatus === "Complete"
              ? data.completedAt ?? t.completedAt ?? now
              : nextStatus === "Open" || nextStatus === "In Progress"
                ? null
                : t.completedAt,
        }
      })
    )
  }, [])

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const markComplete = useCallback((id) => {
    updateTask(id, { status: "Complete" })
  }, [updateTask])

  const createFollowUpForContact = useCallback(
    (contact, dueDate) => {
      const payload = buildFollowUpFromContact(contact, dueDate)
      return addTask(payload)
    },
    [addTask]
  )

  const createFollowUpForAccount = useCallback(
    (account, dueDate) => {
      const payload = buildFollowUpFromAccount(account, dueDate)
      return addTask(payload)
    },
    [addTask]
  )

  const value = {
    tasks: enrichedTasks,
    rawTasks: tasks,
    getTask,
    getTasksByAccount,
    getTasksByContact,
    addTask,
    updateTask,
    deleteTask,
    markComplete,
    createFollowUpForContact,
    createFollowUpForAccount,
  }

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}
