import { useContext } from "react"
import { GmailContext } from "./gmail-context"

export function useGmail() {
  return useContext(GmailContext)
}
