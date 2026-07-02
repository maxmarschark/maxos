import { useCallback, useEffect, useMemo, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import {
  persistCloudDelete,
  persistCloudInsert,
  persistCloudUpdate,
} from "../../lib/supabase/cloudPersist"
import { useAuthReady } from "../auth/useAuthReady"
import { useAccounts } from "../accounts/useAccounts"
import { useBrands } from "../brands/useBrands"
import { useContacts } from "../contacts/useContacts"
import { useOrders } from "../orders/useOrders"
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

function loadCloudApi() {
  return import("./tasksSupabase")
}

export function TasksProvider({ children }) {
  const authReady = useAuthReady()
  const { accounts } = useAccounts()
  const { contacts } = useContacts()
  const { orders } = useOrders()
  const { brands } = useBrands()

  const [tasks, setTasks] = useState(loadInitialTasks)

  const initCloud = useCallback(
    () => loadCloudApi().then(({ initCloudTasks }) => initCloudTasks()),
    []
  )
  const onCloudLoaded = useCallback((result) => {
    setTasks(result.tasks)
  }, [])

  const { storageMode, storageModeRef, fallBackToLocal } = useCloudBootstrap({
    moduleName: "Tasks",
    initCloud,
    onCloudLoaded,
    authReady,
  })

  useEffect(() => {
    saveToStorage(TASKS_STORAGE_KEY, tasks)
  }, [tasks])

  const refs = useMemo(
    () => ({ accounts, contacts, brands, orders }),
    [accounts, contacts, brands, orders]
  )

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

  const addTask = useCallback(
    async (data) => {
      const now = new Date().toISOString()
      const task = {
        ...EMPTY_TASK,
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        completedAt: data.status === "Complete" ? now : null,
      }

      const { insertCloudTask } = await loadCloudApi()
      const persisted = await persistCloudInsert({
        storageModeRef,
        fallBackToLocal,
        insert: insertCloudTask,
        entity: task,
        label: "Tasks",
      })

      if (!persisted.ok) return null
      setTasks((prev) => [persisted.entity, ...prev])
      return persisted.entity
    },
    [fallBackToLocal]
  )

  const updateTask = useCallback(
    async (id, data) => {
      const existing = tasks.find((t) => t.id === id)
      if (!existing) return false

      const now = new Date().toISOString()
      const nextStatus = data.status ?? existing.status
      const updatedTask = {
        ...existing,
        ...data,
        updatedAt: now,
        completedAt:
          nextStatus === "Complete"
            ? data.completedAt ?? existing.completedAt ?? now
            : nextStatus === "Open" || nextStatus === "In Progress"
              ? null
              : existing.completedAt,
      }

      const { updateCloudTask } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        fallBackToLocal,
        update: updateCloudTask,
        entity: updatedTask,
        label: "Tasks",
      })

      if (!persisted.ok) return false
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? persisted.entity : t))
      )
      return true
    },
    [tasks, fallBackToLocal]
  )

  const deleteTask = useCallback(
    async (id) => {
      const { deleteCloudTask } = await loadCloudApi()
      const persisted = await persistCloudDelete({
        storageModeRef,
        fallBackToLocal,
        remove: deleteCloudTask,
        id,
        label: "Tasks",
      })

      if (!persisted.ok) return false
      setTasks((prev) => prev.filter((t) => t.id !== id))
      return true
    },
    [fallBackToLocal]
  )

  const markComplete = useCallback(
    async (id) => {
      return updateTask(id, { status: "Complete" })
    },
    [updateTask]
  )

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
    storageMode,
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
