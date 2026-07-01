import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Package, Plus } from "lucide-react"
import { useOrders } from "../features/orders/useOrders"
import { OrdersTable } from "../features/orders/components/OrdersTable"
import { OrderFormModal } from "../features/orders/components/OrderFormModal"
import { DeleteOrderModal } from "../features/orders/components/DeleteOrderModal"
import { Button } from "../components/ui/Button"
import { SearchInput } from "../components/ui/SearchInput"
import { Select } from "../components/ui/Select"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { Pagination } from "../components/ui/Pagination"
import { useToast } from "../components/ui/useToast"
import { usePagination } from "../hooks/usePagination"
import { sortRows } from "../lib/tableSort"
import { ORDER_STATUSES } from "../features/orders/constants"

function filterOrders(orders, { search, statusFilter, brandFilter, accountFilter }) {
  let result = [...orders]

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.accountName.toLowerCase().includes(q) ||
        o.brandName.toLowerCase().includes(q) ||
        o.productsNotes.toLowerCase().includes(q) ||
        o.notes.toLowerCase().includes(q)
    )
  }

  if (statusFilter) result = result.filter((o) => o.orderStatus === statusFilter)
  if (brandFilter) result = result.filter((o) => o.brandId === brandFilter)
  if (accountFilter) result = result.filter((o) => o.accountId === accountFilter)

  return result
}

const SORT_FIELD_TYPES = {
  orderAmount: "number",
  commissionPercent: "number",
  orderDate: "date",
}

export function OrdersPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { orders, accounts, brands, addOrder, updateOrder, deleteOrder, refreshReferences } =
    useOrders()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [accountFilter, setAccountFilter] = useState("")
  const [sortField, setSortField] = useState("orderDate")
  const [sortDir, setSortDir] = useState("desc")
  const [pageSize, setPageSize] = useState(25)

  const [formOpen, setFormOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [deletingOrder, setDeletingOrder] = useState(null)

  const filtered = useMemo(() => {
    const rows = filterOrders(orders, {
      search,
      statusFilter,
      brandFilter,
      accountFilter,
    })
    return sortRows(rows, sortField, sortDir, SORT_FIELD_TYPES)
  }, [orders, search, statusFilter, brandFilter, accountFilter, sortField, sortDir])

  const pagination = usePagination(filtered, pageSize)

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir(field === "orderDate" ? "desc" : "asc")
    }
  }

  function handleAdd() {
    refreshReferences()
    setEditingOrder(null)
    setFormOpen(true)
  }

  function handleEdit(order) {
    refreshReferences()
    setEditingOrder(order)
    setFormOpen(true)
  }

  function handleFormSubmit(data) {
    if (editingOrder) {
      updateOrder(editingOrder.id, data)
      toast(`Updated order #${data.orderNumber}`)
    } else {
      addOrder(data)
      toast(`Created order #${data.orderNumber}`)
    }
  }

  function handleDelete() {
    deleteOrder(deletingOrder.id)
    toast(`Deleted order #${deletingOrder.orderNumber}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Orders"
        description={`${orders.length} order${orders.length !== 1 ? "s" : ""} tracked`}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleAdd}>
            Add Order
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          className="flex-1"
          placeholder="Search by order #, account, brand, products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.brandName}
            </option>
          ))}
        </Select>
        <Select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">All Accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.businessName}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={Package}
            title={orders.length === 0 ? "No orders yet" : "No matching orders"}
            description={
              orders.length === 0
                ? "Create your first order to track fulfillment and commissions."
                : "Try adjusting your search or filters."
            }
            actionLabel={orders.length === 0 ? "Add Order" : undefined}
            onAction={orders.length === 0 ? handleAdd : undefined}
          />
        </Card>
      ) : (
        <>
          <OrdersTable
            orders={pagination.paginatedItems}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={(id) => navigate(`/orders/${id}`)}
            onEdit={handleEdit}
            onDelete={setDeletingOrder}
          />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            pageSize={pageSize}
            onPageChange={pagination.setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <OrderFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingOrder(null)
        }}
        onSubmit={handleFormSubmit}
        order={editingOrder}
        accounts={accounts}
        brands={brands}
      />

      <DeleteOrderModal
        open={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleDelete}
        orderNumber={deletingOrder?.orderNumber ?? ""}
      />
    </div>
  )
}
