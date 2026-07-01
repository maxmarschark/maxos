import { Outlet } from "react-router-dom"
import { AccountsProvider } from "./AccountsProvider"

export function AccountsLayout() {
  return (
    <AccountsProvider>
      <Outlet />
    </AccountsProvider>
  )
}
