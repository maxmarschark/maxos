import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"
import { PageContainer } from "./PageContainer"
import { CommandPalette } from "../command-palette/CommandPalette"
import { ToastProvider } from "../ui/Toast"
import { useCommandPalette } from "../../hooks/useCommandPalette"
import { useSidebar } from "../../hooks/useSidebar"
import { useLastRoute } from "../../hooks/useLastRoute"
import { AccountsProvider } from "../../features/accounts/AccountsProvider"
import { OrdersProvider } from "../../features/orders/OrdersProvider"
import { ContactsProvider } from "../../features/contacts/ContactsProvider"
import { CommissionsProvider } from "../../features/commissions/CommissionsProvider"
import { TodayBuildProvider } from "../../features/today/TodayBuildProvider"
import { useTodayBuild } from "../../features/today/useTodayBuild"

function AppShellContent() {
  const { isOpen, open, close } = useCommandPalette()
  const { collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile } =
    useSidebar()
  const { buildDayPlan, isBuilding } = useTodayBuild()

  useLastRoute()

  function handleCommandSelect(action) {
    if (action?.id === "build-day") {
      buildDayPlan()
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={toggleCollapsed}
        onCloseMobile={closeMobile}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          onOpenSearch={open}
          onOpenMobile={openMobile}
          onBuildDay={buildDayPlan}
          isBuilding={isBuilding}
        />

        <main className="flex-1 overflow-y-auto">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>

      <CommandPalette
        isOpen={isOpen}
        onClose={close}
        onSelect={handleCommandSelect}
      />
    </div>
  )
}

export function AppShell() {
  return (
    <ToastProvider>
      <AccountsProvider>
        <OrdersProvider>
          <ContactsProvider>
            <CommissionsProvider>
              <TodayBuildProvider>
                <AppShellContent />
              </TodayBuildProvider>
            </CommissionsProvider>
          </ContactsProvider>
        </OrdersProvider>
      </AccountsProvider>
    </ToastProvider>
  )
}
