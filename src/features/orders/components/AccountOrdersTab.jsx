import { useNavigate } from "react-router-dom"
import { Package } from "lucide-react"
import { useOrders } from "../useOrders"
import { OrdersTable } from "./OrdersTable"
import { Card } from "../../../components/ui/Card"
import { EmptyState } from "../../../components/ui/EmptyState"

export function AccountOrdersTab({ accountId }) {
  const navigate = useNavigate()
  const { getOrdersByAccount } = useOrders()
  const orders = getOrdersByAccount(accountId)

  if (orders.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Orders placed with this account will appear here."
        />
      </Card>
    )
  }

  return (
    <OrdersTable
      orders={orders}
      sortField="orderDate"
      sortDir="desc"
      onSort={() => {}}
      onRowClick={(id) => navigate(`/orders/${id}`)}
      compact
    />
  )
}
