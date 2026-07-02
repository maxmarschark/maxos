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
import { CALENDAR_STORAGE_KEY, EMPTY_CALENDAR_EVENT } from "./constants"
import { CalendarContext } from "./calendar-context"

function loadLocalEvents() {
  return loadFromStorage(CALENDAR_STORAGE_KEY, [])
}

function loadCloudApi() {
  return import("./calendarSupabase")
}

export function CalendarProvider({ children }) {
  const authReady = useAuthReady()
  const [events, setEvents] = useState(loadLocalEvents)

  const initCloud = useCallback(
    () => loadCloudApi().then(({ initCloudCalendar }) => initCloudCalendar()),
    []
  )
  const onCloudLoaded = useCallback((result) => {
    setEvents(result.events)
  }, [])

  const { storageMode, storageModeRef, fallBackToLocal } = useCloudBootstrap({
    moduleName: "Calendar",
    initCloud,
    onCloudLoaded,
    authReady,
  })

  useEffect(() => {
    saveToStorage(CALENDAR_STORAGE_KEY, events)
  }, [events])

  const getEvent = useCallback((id) => events.find((e) => e.id === id), [events])

  const addEvent = useCallback(
    async (data) => {
      const now = new Date().toISOString()
      const event = {
        ...EMPTY_CALENDAR_EVENT,
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }

      const { insertCloudCalendarEvent } = await loadCloudApi()
      const persisted = await persistCloudInsert({
        storageModeRef,
        fallBackToLocal,
        insert: insertCloudCalendarEvent,
        entity: event,
        label: "Calendar",
      })

      if (!persisted.ok) return null
      setEvents((prev) => [persisted.entity, ...prev])
      return persisted.entity
    },
    [fallBackToLocal]
  )

  const updateEvent = useCallback(
    async (id, data) => {
      const existing = events.find((e) => e.id === id)
      if (!existing) return false

      const updatedEvent = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      }

      const { updateCloudCalendarEvent } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        fallBackToLocal,
        update: updateCloudCalendarEvent,
        entity: updatedEvent,
        label: "Calendar",
      })

      if (!persisted.ok) return false
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? persisted.entity : e))
      )
      return true
    },
    [events, fallBackToLocal]
  )

  const deleteEvent = useCallback(
    async (id) => {
      const { deleteCloudCalendarEvent } = await loadCloudApi()
      const persisted = await persistCloudDelete({
        storageModeRef,
        fallBackToLocal,
        remove: deleteCloudCalendarEvent,
        id,
        label: "Calendar",
      })

      if (!persisted.ok) return false
      setEvents((prev) => prev.filter((e) => e.id !== id))
      return true
    },
    [fallBackToLocal]
  )

  const value = {
    events,
    storageMode,
    getEvent,
    addEvent,
    updateEvent,
    deleteEvent,
  }

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}
