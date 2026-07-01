import { useCallback, useEffect, useState } from "react"
import { loadFromStorage, saveToStorage } from "../lib/storage"

const STORAGE_KEY = "max-os-sidebar-collapsed"

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() =>
    loadFromStorage(STORAGE_KEY, false)
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      saveToStorage(STORAGE_KEY, next)
      return next
    })
  }, [])

  const openMobile = useCallback(() => setMobileOpen(true), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), [])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return { collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile, toggleMobile }
}
