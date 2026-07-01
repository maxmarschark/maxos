import { createBrowserRouter } from "react-router-dom"
import { AppShell } from "../components/layout/AppShell"
import { TodayPage } from "../pages/TodayPage"
import { AccountsLayout } from "../features/accounts/AccountsLayout"
import { AccountsPage } from "../pages/AccountsPage"
import { AccountProfilePage } from "../pages/AccountProfilePage"
import {
  ContactsPage,
  BrandsPage,
  OrdersPage,
  DealsPage,
  CalendarPage,
  CommissionsPage,
  ReportsPage,
  SettingsPage,
} from "../pages/modules"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <TodayPage />,
        handle: {
          title: "Today",
          description: "Your daily command center",
        },
      },
      {
        path: "contacts",
        element: <ContactsPage />,
        handle: { title: "Contacts", description: "Buyers, managers, and decision makers" },
      },
      {
        path: "accounts",
        element: <AccountsLayout />,
        handle: { title: "Accounts", description: "Retailers, distributors, and store locations" },
        children: [
          {
            index: true,
            element: <AccountsPage />,
          },
          {
            path: ":id",
            element: <AccountProfilePage />,
          },
        ],
      },
      {
        path: "brands",
        element: <BrandsPage />,
        handle: { title: "Brands", description: "Brand partners and product lines" },
      },
      {
        path: "orders",
        element: <OrdersPage />,
        handle: { title: "Orders", description: "Purchase orders and fulfillment" },
      },
      {
        path: "deals",
        element: <DealsPage />,
        handle: { title: "Deals", description: "Pipeline and active negotiations" },
      },
      {
        path: "calendar",
        element: <CalendarPage />,
        handle: { title: "Calendar", description: "Visits, calls, and follow-ups" },
      },
      {
        path: "commissions",
        element: <CommissionsPage />,
        handle: { title: "Commissions", description: "Earnings, payouts, and reconciliation" },
      },
      {
        path: "reports",
        element: <ReportsPage />,
        handle: { title: "Reports", description: "Revenue, performance, and analytics" },
      },
      {
        path: "settings",
        element: <SettingsPage />,
        handle: { title: "Settings", description: "Profile, preferences, and integrations" },
      },
    ],
  },
])
