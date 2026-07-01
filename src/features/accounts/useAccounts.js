import { useContext } from "react"
import { AccountsContext } from "./accounts-context"

export function useAccounts() {
  const ctx = useContext(AccountsContext)
  if (!ctx) {
    throw new Error("useAccounts must be used within AccountsProvider")
  }
  return ctx
}
