import { useCallback, useEffect, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import { CALENDAR_STORAGE_KEY, EMPTY_CALENDAR_EVENT } from "./constants"
import { CalendarContext } from "./calendar-context"

function loadLocalEvents() {
  return loadFromStorage(CALENDAR_STORAGE_KEY, [])
}

function loadCloudApi() {
  return import("./calendarSupabase")
}

export function CalendarProvider({ children }) {
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
  })

  useEffect(() => {
    saveToStorage(CALENDAR_STORAGE_KEY, events)
  }, [events])

  const syncEventToCloud = useCallback(
    async (event) => {
      if (storageModeRef.current !== "cloud") return true
      const { updateCloudCalendarEvent } = await loadCloudApi()
      const result = await updateCloudCalendarEvent(event)
      if (!result.ok) {
        console.error("[Max OS Calendar] Cloud update failed:", result.error)
        fallBackToLocal()
        return false
      }
      return true
    },
    [fallBackToLocal]
  )

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

      if (storageModeRef.current === "cloud") {
        const { insertCloudCalendarEvent } = await loadCloudApi()
        const result = await insertCloudCalendarEvent(event)
        if (result.ok) {
          setEvents((prev) => [result.event, ...prev])
          return result.event
        }
        console.error("[Max OS Calendar] Cloud insert failed:", result.error)
        fallBackToLocal()
      }

      setEvents((prev) => [event, ...prev])
      return event
    },
    [fallBackToLocal]
  )

  const updateEvent = useCallback(
    (id, data) => {
      const now = new Date().toISOString()
      let updatedEvent = null

      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e
          updatedEvent = { ...e, ...data, updatedAt: now }
          return updatedEvent
        })
      )

      if (updatedEvent) {
        void syncEventToCloud(updatedEvent)
      }
    },
    [syncEventToCloud]
  )

  const deleteEvent = useCallback(
    async (id) => {
      if (storageModeRef.current === "cloud") {
        const { deleteCloudCalendarEvent } = await loadCloudApi()
        const result = await deleteCloudCalendarEvent(id)
        if (!result.ok) {
          console.error("[Max OS Calendar] Cloud delete failed:", result.error)
          fallBackToLocal()
        }
      }
      setEvents((prev) => prev.filter((e) => e.id !== id))
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
