import { useNavigate } from "react-router-dom"
import { Package } from "lucide-react"
import { useOrders } from "../useOrders"
import { OrdersTable } from "./OrdersTable"
import { Card } from "../../../components/ui/Card"
import { EmptyState } from "../../../components/ui/EmptyState"

export function BrandOrdersTab({ brandId }) {
  const navigate = useNavigate()
  const { getOrdersByBrand } = useOrders()
  const orders = getOrdersByBrand(brandId)

  if (orders.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Orders for this brand will appear here."
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
