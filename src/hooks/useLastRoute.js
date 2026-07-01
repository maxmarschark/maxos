import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  markRouteRestored,
  saveLastRoute,
  shouldRestoreLastRoute,
  getLastRoute,
} from "../lib/lastRoute"

export function useLastRoute() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    saveLastRoute(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    if (!shouldRestoreLastRoute(location.pathname)) return
    const last = getLastRoute()
    if (last && last !== location.pathname) {
      markRouteRestored()
      navigate(last, { replace: true })
    }
  }, [location.pathname, navigate])
}
