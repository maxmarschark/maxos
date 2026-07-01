import { useContext } from "react"
import { CommissionsContext } from "./commissions-context"

export function useCommissions() {
  const ctx = useContext(CommissionsContext)
  if (!ctx) {
    throw new Error("useCommissions must be used within CommissionsProvider")
  }
  return ctx
}
