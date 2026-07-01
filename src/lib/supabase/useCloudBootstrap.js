import { useCallback, useEffect, useRef, useState } from "react"
import { isSupabaseConfigured } from "./env"
import { createLogPrefix } from "./cloudRepository"

export function useCloudBootstrap({ moduleName, loadCloudApi, onCloudLoaded }) {
  const [storageMode, setStorageMode] = useState("local")
  const storageModeRef = useRef("local")
  const LOG_PREFIX = createLogPrefix(moduleName)

  const setMode = useCallback((mode) => {
    storageModeRef.current = mode
    setStorageMode(mode)
  }, [])

  const fallBackToLocal = useCallback(() => {
    console.warn(`${LOG_PREFIX} LOCAL — falling back to localStorage`)
    setMode("local")
  }, [LOG_PREFIX, setMode])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!isSupabaseConfigured()) {
        console.info(`${LOG_PREFIX} LOCAL — Supabase env vars not configured`)
        return
      }

      const api = await loadCloudApi()
      const result = await api.init()
      if (cancelled) return

      if (result.ok) {
        onCloudLoaded(result)
        setMode("cloud")
        return
      }

      console.info(
        `${LOG_PREFIX} LOCAL — using localStorage fallback`,
        result.reason ? `(${result.reason})` : ""
      )
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [LOG_PREFIX, loadCloudApi, onCloudLoaded, setMode])

  return { storageMode, storageModeRef, setMode, fallBackToLocal }
}
