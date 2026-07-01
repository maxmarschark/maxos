import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"
import { PageContainer } from "./PageContainer"
import { CommandPalette } from "../command-palette/CommandPalette"
import { useCommandPalette } from "../../hooks/useCommandPalette"
import { useSidebar } from "../../hooks/useSidebar"
import { OrdersProvider } from "../../features/orders/OrdersProvider"
import { ContactsProvider } from "../../features/contacts/ContactsProvider"
import { CommissionsProvider } from "../../features/commissions/CommissionsProvider"

export function AppShell() {
  const { isOpen, open, close } = useCommandPalette()
  const { collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile } =
    useSidebar()

  function handleCommandSelect() {
    // Commands will be wired to real actions in future iterations
  }

  return (
    <OrdersProvider>
      <ContactsProvider>
        <CommissionsProvider>
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
                onBuildDay={() => handleCommandSelect({ id: "build-day" })}
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
        </CommissionsProvider>
      </ContactsProvider>
    </OrdersProvider>
  )
}
