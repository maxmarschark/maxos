import { Package } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { EmptyState } from "../../../../components/ui/EmptyState"

export function OrdersTab() {
  return (
    <Card padding="none">
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Orders for this brand will appear here once the Orders module is connected."
      />
    </Card>
  )
}
