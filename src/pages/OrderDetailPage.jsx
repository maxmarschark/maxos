import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useOrders } from "../features/orders/useOrders"
import { OrderFormModal } from "../features/orders/components/OrderFormModal"
import { DeleteOrderModal } from "../features/orders/components/DeleteOrderModal"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card } from "../components/ui/Card"
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatDate,
  formatPercent,
} from "../lib/format"
import {
  ORDER_STATUS_VARIANTS,
  PAYMENT_STATUS_VARIANTS,
} from "../features/orders/constants"

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-sm text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-200 sm:text-right">{children}</dd>
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getOrder, updateOrder, deleteOrder, accounts, brands, refreshReferences } =
    useOrders()

  const order = getOrder(id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-zinc-200">Order not found</h2>
        <p className="mt-2 text-sm text-zinc-500">This order may have been deleted.</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </Button>
      </div>
    )
  }

  function handleDelete() {
    deleteOrder(order.id)
    navigate("/orders")
  }

  function handleEdit() {
    refreshReferences()
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft size={14} />
          Back to Orders
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                Order #{order.orderNumber}
              </h1>
              <Badge variant={ORDER_STATUS_VARIANTS[order.orderStatus] ?? "default"}>
                {order.orderStatus}
              </Badge>
              <Badge variant={PAYMENT_STATUS_VARIANTS[order.paymentStatus] ?? "default"}>
                {order.paymentStatus}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              Placed {formatDate(order.orderDate)}
              {order.paymentDueDate && ` · Payment due ${formatDate(order.paymentDueDate)}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Pencil} onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="md" className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-300">Order Details</h2>
          <dl className="space-y-3">
            <DetailRow label="Account">
              <Link
                to={`/accounts/${order.accountId}`}
                className="text-indigo-400 transition-colors hover:text-indigo-300"
              >
                {order.accountName}
              </Link>
            </DetailRow>
            <DetailRow label="Brand">
              <Link
                to={`/brands/${order.brandId}`}
                className="text-indigo-400 transition-colors hover:text-indigo-300"
              >
                {order.brandName}
              </Link>
            </DetailRow>
            <DetailRow label="Order Date">{formatDate(order.orderDate)}</DetailRow>
            <DetailRow label="Payment Due Date">
              {formatDate(order.paymentDueDate)}
            </DetailRow>
          </dl>
        </Card>

        <Card padding="md" className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-300">Financials</h2>
          <dl className="space-y-3">
            <DetailRow label="Order Amount">
              <span className="text-base font-semibold text-zinc-100">
                {formatCurrency(order.orderAmount)}
              </span>
            </DetailRow>
            <DetailRow label="Commission %">{formatPercent(order.commissionPercent)}</DetailRow>
            <DetailRow label="Commission $">
              <span className="font-medium text-emerald-400">
                {formatCurrencyDetailed(order.commissionAmount)}
              </span>
            </DetailRow>
          </dl>
        </Card>

        {order.productsNotes && (
          <Card padding="md" className="space-y-2 lg:col-span-2">
            <h2 className="text-sm font-medium text-zinc-300">Products / Notes</h2>
            <p className="text-sm leading-relaxed text-zinc-400">{order.productsNotes}</p>
          </Card>
        )}

        {order.notes && (
          <Card padding="md" className="space-y-2 lg:col-span-2">
            <h2 className="text-sm font-medium text-zinc-300">Internal Notes</h2>
            <p className="text-sm leading-relaxed text-zinc-400">{order.notes}</p>
          </Card>
        )}
      </div>

      <OrderFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => updateOrder(order.id, data)}
        order={order}
        accounts={accounts}
        brands={brands}
      />

      <DeleteOrderModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        orderNumber={order.orderNumber}
      />
    </div>
  )
}
