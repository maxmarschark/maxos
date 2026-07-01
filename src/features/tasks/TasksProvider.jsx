import { useCallback, useEffect, useMemo, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
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
  })

  useEffect(() => {
    saveToStorage(TASKS_STORAGE_KEY, tasks)
  }, [tasks])

  const syncTaskToCloud = useCallback(
    async (task) => {
      if (storageModeRef.current !== "cloud") return true
      const { updateCloudTask } = await loadCloudApi()
      const result = await updateCloudTask(task)
      if (!result.ok) {
        console.error("[Max OS Tasks] Cloud update failed:", result.error)
        fallBackToLocal()
        return false
      }
      return true
    },
    [fallBackToLocal]
  )

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

      if (storageModeRef.current === "cloud") {
        const { insertCloudTask } = await loadCloudApi()
        const result = await insertCloudTask(task)
        if (result.ok) {
          setTasks((prev) => [result.task, ...prev])
          return result.task
        }
        console.error("[Max OS Tasks] Cloud insert failed:", result.error)
        fallBackToLocal()
      }

      setTasks((prev) => [task, ...prev])
      return task
    },
    [fallBackToLocal]
  )

  const updateTask = useCallback(
    (id, data) => {
      let updatedTask = null

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          const now = new Date().toISOString()
          const nextStatus = data.status ?? t.status
          updatedTask = {
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
          return updatedTask
        })
      )

      if (updatedTask) {
        void syncTaskToCloud(updatedTask)
      }
    },
    [syncTaskToCloud]
  )

  const deleteTask = useCallback(
    async (id) => {
      if (storageModeRef.current === "cloud") {
        const { deleteCloudTask } = await loadCloudApi()
        const result = await deleteCloudTask(id)
        if (!result.ok) {
          console.error("[Max OS Tasks] Cloud delete failed:", result.error)
          fallBackToLocal()
        }
      }
      setTasks((prev) => prev.filter((t) => t.id !== id))
    },
    [fallBackToLocal]
  )

  const markComplete = useCallback(
    (id) => {
      updateTask(id, { status: "Complete" })
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
