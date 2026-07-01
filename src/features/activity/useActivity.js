import { useContext } from "react"
import { ActivityContext } from "./activity-context"

export function useActivity() {
  const ctx = useContext(ActivityContext)
  if (!ctx) {
    throw new Error("useActivity must be used within ActivityProvider")
  }
  return ctx
}
