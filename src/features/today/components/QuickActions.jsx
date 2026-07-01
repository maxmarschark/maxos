import { useNavigate } from "react-router-dom"
import {
  Building2,
  UserPlus,
  Package,
  MapPin,
  FileText,
} from "lucide-react"
import { Card, CardHeader } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"

export function QuickActions({ onLogVisit }) {
  const navigate = useNavigate()

  const actions = [
    { label: "Add Account", icon: Building2, onClick: () => navigate("/accounts") },
    { label: "Add Contact", icon: UserPlus, onClick: () => navigate("/contacts") },
    { label: "Add Order", icon: Package, onClick: () => navigate("/orders") },
    { label: "Log Visit", icon: MapPin, onClick: onLogVisit },
    { label: "Create Invoice", icon: FileText, onClick: () => navigate("/commissions") },
  ]

  return (
    <Card padding="md">
      <CardHeader title="Quick Actions" description="Jump to common workflows" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="secondary"
            size="sm"
            icon={action.icon}
            onClick={action.onClick}
            className="justify-start"
          >
            {action.label}
          </Button>
        ))}
      </div>
    </Card>
  )
}
