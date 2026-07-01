import { useNavigate } from "react-router-dom"
import { Package } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { EmptyState } from "../../../components/ui/EmptyState"
import { OrdersTable } from "../../orders/components/OrdersTable"
import { getOrdersForContact } from "../../../lib/relationships"

export function ContactOrdersSection({ contact, orders }) {
  const navigate = useNavigate()
  const contactOrders = getOrdersForContact(contact, orders)

  if (contactOrders.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          icon={Package}
          title="No related orders"
          description="Orders for this contact's account or brand will appear here."
        />
      </Card>
    )
  }

  return (
    <OrdersTable
      orders={contactOrders}
      sortField="orderDate"
      sortDir="desc"
      onSort={() => {}}
      onRowClick={(id) => navigate(`/orders/${id}`)}
      compact
    />
  )
}
