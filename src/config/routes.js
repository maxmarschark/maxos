import {
  Sun,
  Users,
  Building2,
  Tags,
  Package,
  Handshake,
  CalendarDays,
  CheckSquare,
  DollarSign,
  BarChart3,
  Settings,
} from "lucide-react"

export const routes = [
  {
    path: "/",
    id: "today",
    name: "Today",
    icon: Sun,
    description: "Your daily command center",
  },
  {
    path: "/contacts",
    id: "contacts",
    name: "Contacts",
    icon: Users,
    description: "Buyers, managers, and decision makers",
  },
  {
    path: "/accounts",
    id: "accounts",
    name: "Accounts",
    icon: Building2,
    description: "Retailers, distributors, and store locations",
  },
  {
    path: "/brands",
    id: "brands",
    name: "Brands",
    icon: Tags,
    description: "Brand partners and product lines",
  },
  {
    path: "/orders",
    id: "orders",
    name: "Orders",
    icon: Package,
    description: "Purchase orders and fulfillment",
  },
  {
    path: "/tasks",
    id: "tasks",
    name: "Tasks",
    icon: CheckSquare,
    description: "Follow-ups, calls, and daily action items",
  },
  {
    path: "/deals",
    id: "deals",
    name: "Deals",
    icon: Handshake,
    description: "Pipeline and active negotiations",
  },
  {
    path: "/calendar",
    id: "calendar",
    name: "Calendar",
    icon: CalendarDays,
    description: "Visits, calls, and follow-ups",
  },
  {
    path: "/commissions",
    id: "commissions",
    name: "Commissions",
    icon: DollarSign,
    description: "Earnings, payouts, and reconciliation",
  },
  {
    path: "/reports",
    id: "reports",
    name: "Reports",
    icon: BarChart3,
    description: "Revenue, performance, and analytics",
  },
  {
    path: "/settings",
    id: "settings",
    name: "Settings",
    icon: Settings,
    description: "Profile, preferences, and integrations",
  },
]

export const navRoutes = routes

export function getRouteByPath(path) {
  return routes.find((r) => r.path === path) ?? routes[0]
}

export function getRouteById(id) {
  return routes.find((r) => r.id === id) ?? routes[0]
}
