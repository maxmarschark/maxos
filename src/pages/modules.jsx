import { ModulePage } from "./ModulePage"
import { getRouteById } from "../config/routes"

function createModulePage(id, actionLabel) {
  return function Page() {
    const route = getRouteById(id)
    return (
      <ModulePage
        icon={route.icon}
        title={route.name}
        description={route.description}
        actionLabel={actionLabel}
      />
    )
  }
}

export const ContactsPage = createModulePage("contacts", "Add Contact")
export const BrandsPage = createModulePage("brands", "Add Brand")
export const OrdersPage = createModulePage("orders", "New Order")
export const DealsPage = createModulePage("deals", "New Deal")
export const CalendarPage = createModulePage("calendar", "Schedule Event")
export const CommissionsPage = createModulePage("commissions", "Record Payout")
export const ReportsPage = createModulePage("reports")
export const SettingsPage = createModulePage("settings")
