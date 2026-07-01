import { useCallback, useEffect, useRef, useState } from "react"
import { isSupabaseConfigured } from "./env"
import { createLogPrefix, describeCloudFailure } from "./cloudRepository"

export function useCloudBootstrap({ moduleName, initCloud, onCloudLoaded }) {
  const [storageMode, setStorageMode] = useState("local")
  const storageModeRef = useRef("local")
  const LOG_PREFIX = createLogPrefix(moduleName)

  const setMode = useCallback((mode) => {
    storageModeRef.current = mode
    setStorageMode(mode)
  }, [])

  const fallBackToLocal = useCallback(
    (reason) => {
      console.warn(`${LOG_PREFIX} LOCAL — falling back to localStorage${reason ? ` (${reason})` : ""}`)
      setMode("local")
    },
    [LOG_PREFIX, setMode]
  )

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!isSupabaseConfigured()) {
        console.info(`${LOG_PREFIX} LOCAL — Supabase env vars not configured`)
        return
      }

      try {
        const result = await initCloud()
        if (cancelled) return

        if (result.ok) {
          onCloudLoaded(result)
          setMode("cloud")
          console.info(`${LOG_PREFIX} CLOUD — ${result.logMessage ?? "connected"}`)
          return
        }

        console.info(`${LOG_PREFIX} LOCAL — ${describeCloudFailure(result)}`)
      } catch (error) {
        if (!cancelled) {
          console.info(`${LOG_PREFIX} LOCAL — ${error?.message ?? "bootstrap failed"}`)
        }
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [LOG_PREFIX, initCloud, onCloudLoaded, setMode])

  return { storageMode, storageModeRef, setMode, fallBackToLocal }
}
