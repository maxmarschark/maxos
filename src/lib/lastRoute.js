import { loadFromStorage, saveToStorage } from "./storage"

export const LAST_ROUTE_KEY = "max-os-last-route"
const SESSION_RESTORED_KEY = "max-os-route-restored"

export function saveLastRoute(pathname) {
  if (!pathname) return
  saveToStorage(LAST_ROUTE_KEY, pathname)
}

export function getLastRoute() {
  return loadFromStorage(LAST_ROUTE_KEY, null)
}

export function shouldRestoreLastRoute(pathname) {
  if (pathname !== "/") return false
  const last = getLastRoute()
  if (!last || last === "/") return false
  try {
    return sessionStorage.getItem(SESSION_RESTORED_KEY) !== "1"
  } catch {
    return false
  }
}

export function markRouteRestored() {
  try {
    sessionStorage.setItem(SESSION_RESTORED_KEY, "1")
  } catch {
    /* ignore */
  }
}
