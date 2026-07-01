import { useContext } from "react"
import { TodayBuildContext } from "./today-build-context"

export function useTodayBuild() {
  const ctx = useContext(TodayBuildContext)
  if (!ctx) {
    throw new Error("useTodayBuild must be used within TodayBuildProvider")
  }
  return ctx
}
