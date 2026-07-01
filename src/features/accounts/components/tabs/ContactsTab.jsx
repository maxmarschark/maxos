import { Users } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { EmptyState } from "../../../../components/ui/EmptyState"

export function ContactsTab() {
  return (
    <Card padding="none">
      <EmptyState
        icon={Users}
        title="No contacts linked"
        description="Contacts for this account will appear here once the Contacts module is connected."
      />
    </Card>
  )
}
