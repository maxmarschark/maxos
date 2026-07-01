import {
  Sparkles,
  UserPlus,
  Building2,
  Tags,
  Package,
  Banknote,
  FileText,
  Search,
} from "lucide-react"

export const commandActions = [
  { id: "build-day", label: "Build My Day", icon: Sparkles, group: "Actions" },
  { id: "add-contact", label: "Add Contact", icon: UserPlus, group: "Create" },
  { id: "add-account", label: "Add Account", icon: Building2, group: "Create" },
  { id: "add-brand", label: "Add Brand", icon: Tags, group: "Create" },
  { id: "add-order", label: "Add Order", icon: Package, group: "Create" },
  { id: "record-payment", label: "Record Payment", icon: Banknote, group: "Create" },
  { id: "create-invoice", label: "Create Invoice", icon: FileText, group: "Create" },
  { id: "search-accounts", label: "Search Accounts", icon: Search, group: "Search" },
]
