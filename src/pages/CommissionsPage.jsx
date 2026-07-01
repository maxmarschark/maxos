import { useMemo, useState } from "react"
import { DollarSign } from "lucide-react"
import { useCommissions } from "../features/commissions/useCommissions"
import { CommissionSummaryCards } from "../features/commissions/components/CommissionSummaryCards"
import { CommissionsTable } from "../features/commissions/components/CommissionsTable"
import { CommissionFormModal } from "../features/commissions/components/CommissionFormModal"
import { BrandBreakdown } from "../features/commissions/components/BrandBreakdown"
import { AccountBreakdown } from "../features/commissions/components/AccountBreakdown"
import { SearchInput } from "../components/ui/SearchInput"
import { Select } from "../components/ui/Select"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { StorageModeBadge } from "../components/ui/StorageModeBadge"
import { Pagination } from "../components/ui/Pagination"
import { useToast } from "../components/ui/useToast"
import { usePagination } from "../hooks/usePagination"
import { COMMISSION_STATUSES } from "../features/commissions/constants"

function filterCommissions(commissions, { search, statusFilter, brandFilter, accountFilter }) {
  let result = [...commissions]

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (c) =>
        c.orderNumber.toLowerCase().includes(q) ||
        c.accountName.toLowerCase().includes(q) ||
        c.brandName.toLowerCase().includes(q)
    )
  }

  if (statusFilter) {
    result = result.filter((c) => c.status === statusFilter)
  }

  if (brandFilter) {
    result = result.filter((c) => c.brandId === brandFilter)
  }

  if (accountFilter) {
    result = result.filter((c) => c.accountId === accountFilter)
  }

  return result
}

export function CommissionsPage() {
  const { toast } = useToast()
  const {
    commissions,
    summary,
    brandBreakdown,
    accountBreakdown,
    updateCommission,
    markStatus,
    storageMode,
  } = useCommissions()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [accountFilter, setAccountFilter] = useState("")
  const [pageSize, setPageSize] = useState(25)
  const [editingCommission, setEditingCommission] = useState(null)

  const brandsInData = useMemo(() => {
    const map = new Map()
    commissions.forEach((c) => {
      if (c.brandId) map.set(c.brandId, c.brandName)
    })
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [commissions])

  const accountsInData = useMemo(() => {
    const map = new Map()
    commissions.forEach((c) => {
      if (c.accountId) map.set(c.accountId, c.accountName)
    })
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [commissions])

  const filtered = useMemo(
    () => filterCommissions(commissions, { search, statusFilter, brandFilter, accountFilter }),
    [commissions, search, statusFilter, brandFilter, accountFilter]
  )

  const pagination = usePagination(filtered, pageSize)

  function handleEditSubmit(data) {
    updateCommission(editingCommission.orderId, data)
    toast(`Updated commission for order #${editingCommission.orderNumber}`)
  }

  function handleMarkStatus(id, status) {
    markStatus(id, status)
    toast(`Commission marked as ${status}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={DollarSign}
        title="Commissions"
        description={`${commissions.length} commission record${commissions.length !== 1 ? "s" : ""} from orders`}
        badge={<StorageModeBadge mode={storageMode} />}
      />

      <CommissionSummaryCards summary={summary} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          className="flex-1"
          placeholder="Search by order #, account, brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">All Statuses</option>
          {COMMISSION_STATUSES.map((s) => (
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
          {brandsInData.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
        <Select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">All Accounts</option>
          {accountsInData.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={DollarSign}
            title={commissions.length === 0 ? "No commissions yet" : "No matching commissions"}
            description={
              commissions.length === 0
                ? "Commission records are generated automatically from orders."
                : "Try adjusting your search or filters."
            }
          />
        </Card>
      ) : (
        <>
          <CommissionsTable
            commissions={pagination.paginatedItems}
            onEdit={setEditingCommission}
            onMarkInvoiced={(id) => handleMarkStatus(id, "Invoiced")}
            onMarkPaid={(id) => handleMarkStatus(id, "Paid")}
            onMarkDisputed={(id) => handleMarkStatus(id, "Disputed")}
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BrandBreakdown breakdown={brandBreakdown} />
        <AccountBreakdown breakdown={accountBreakdown} />
      </div>

      <CommissionFormModal
        open={Boolean(editingCommission)}
        onClose={() => setEditingCommission(null)}
        onSubmit={handleEditSubmit}
        commission={editingCommission}
      />
    </div>
  )
}
