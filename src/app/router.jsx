import { createBrowserRouter } from "react-router-dom"
import { AppShell } from "../components/layout/AppShell"
import { TodayPage } from "../pages/TodayPage"
import { AccountsLayout } from "../features/accounts/AccountsLayout"
import { AccountsPage } from "../pages/AccountsPage"
import { AccountProfilePage } from "../pages/AccountProfilePage"
import { BrandsLayout } from "../features/brands/BrandsLayout"
import { BrandsPage } from "../pages/BrandsPage"
import { BrandProfilePage } from "../pages/BrandProfilePage"
import { OrdersLayout } from "../features/orders/OrdersLayout"
import { OrdersPage } from "../pages/OrdersPage"
import { OrderDetailPage } from "../pages/OrderDetailPage"
import { ContactsLayout } from "../features/contacts/ContactsLayout"
import { ContactsPage } from "../pages/ContactsPage"
import { ContactProfilePage } from "../pages/ContactProfilePage"
import { CommissionsPage } from "../pages/CommissionsPage"
import { SettingsPage } from "../pages/SettingsPage"
import { DealsPage, CalendarPage, ReportsPage } from "../pages/modules"

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
        element: <ContactsLayout />,
        handle: { title: "Contacts", description: "Buyers, managers, and decision makers" },
        children: [
          { index: true, element: <ContactsPage /> },
          { path: ":id", element: <ContactProfilePage /> },
        ],
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
        element: <BrandsLayout />,
        handle: { title: "Brands", description: "Brand partners and product lines" },
        children: [
          { index: true, element: <BrandsPage /> },
          { path: ":id", element: <BrandProfilePage /> },
        ],
      },
      {
        path: "orders",
        element: <OrdersLayout />,
        handle: { title: "Orders", description: "Purchase orders and fulfillment" },
        children: [
          { index: true, element: <OrdersPage /> },
          { path: ":id", element: <OrderDetailPage /> },
        ],
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
