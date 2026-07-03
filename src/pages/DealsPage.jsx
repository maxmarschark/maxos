import { useMemo, useState } from "react"
import { Handshake, Plus } from "lucide-react"
import { useDeals } from "../features/deals/useDeals"
import { useAccounts } from "../features/accounts/useAccounts"
import { useBrands } from "../features/brands/useBrands"
import { DealsTable } from "../features/deals/components/DealsTable"
import { DealFormModal } from "../features/deals/components/DealFormModal"
import { DeleteDealModal } from "../features/deals/components/DeleteDealModal"
import { DEAL_STAGES } from "../features/deals/constants"
import { Button } from "../components/ui/Button"
import { SearchInput } from "../components/ui/SearchInput"
import { Select } from "../components/ui/Select"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { StorageModeBadge } from "../components/ui/StorageModeBadge"
import { Pagination } from "../components/ui/Pagination"
import { useToast } from "../components/ui/useToast"
import { usePagination } from "../hooks/usePagination"
import { useTableSort } from "../hooks/useTableSort"
import { sortRowsByField } from "../lib/tableSort"
import { handleCloudSave } from "../lib/handleCloudSave"

function enrichDeals(deals, accounts, brands) {
  return deals.map((deal) => ({
    ...deal,
    accountName: accounts.find((a) => a.id === deal.accountId)?.businessName ?? "",
    brandName: brands.find((b) => b.id === deal.brandId)?.brandName ?? "",
  }))
}

function filterDeals(deals, { search, stageFilter }) {
  let result = [...deals]

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.accountName.toLowerCase().includes(q) ||
        d.brandName.toLowerCase().includes(q) ||
        d.stage.toLowerCase().includes(q) ||
        d.notes.toLowerCase().includes(q)
    )
  }

  if (stageFilter) {
    result = result.filter((d) => d.stage === stageFilter)
  }

  return result
}

const SORT_FIELD_TYPES = {
  value: "number",
}

export function DealsPage() {
  const { toast } = useToast()
  const { deals, storageMode, addDeal, updateDeal, deleteDeal } = useDeals()
  const { accounts } = useAccounts()
  const { brands } = useBrands()

  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState("")
  const { sortField, sortDir, handleSort } = useTableSort("title", "asc")
  const [pageSize, setPageSize] = useState(25)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [deletingDeal, setDeletingDeal] = useState(null)

  const enriched = useMemo(
    () => enrichDeals(deals, accounts, brands),
    [deals, accounts, brands]
  )

  const filtered = useMemo(() => {
    const rows = filterDeals(enriched, { search, stageFilter })
    return sortRowsByField(rows, sortField, sortDir, SORT_FIELD_TYPES)
  }, [enriched, search, stageFilter, sortField, sortDir])

  const pagination = usePagination(filtered, pageSize)

  const openCount = deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").length

  function handleAdd() {
    setEditingDeal(null)
    setFormOpen(true)
  }

  function handleEdit(deal) {
    setEditingDeal(deal)
    setFormOpen(true)
  }

  async function handleFormSubmit(data) {
    if (editingDeal) {
      await handleCloudSave(() => updateDeal(editingDeal.id, data), {
        onSuccess: () => toast(`Updated ${data.title}`),
        onError: () => toast("Failed to update deal", "error"),
      })
    } else {
      await handleCloudSave(() => addDeal(data), {
        onSuccess: () => toast(`Added ${data.title}`),
        onError: () => toast("Failed to add deal", "error"),
      })
    }
  }

  async function handleDelete() {
    const ok = await handleCloudSave(() => deleteDeal(deletingDeal.id), {
      onError: () => toast("Failed to delete deal", "error"),
    })
    if (!ok) return
    toast(`Deleted ${deletingDeal.title}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Handshake}
        title="Deals"
        description={`${openCount} open deal${openCount !== 1 ? "s" : ""} · ${deals.length} total`}
        badge={<StorageModeBadge mode={storageMode} />}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleAdd}>
            Add Deal
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          className="flex-1"
          placeholder="Search by title, account, brand, stage..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="">All Stages</option>
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={Handshake}
            title={deals.length === 0 ? "No deals yet" : "No matching deals"}
            description={
              deals.length === 0
                ? "Add your first deal to track pipeline opportunities."
                : "Try adjusting your search or filter."
            }
            actionLabel={deals.length === 0 ? "Add Deal" : undefined}
            onAction={deals.length === 0 ? handleAdd : undefined}
          />
        </Card>
      ) : (
        <>
          <DealsTable
            deals={pagination.paginatedItems}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={setDeletingDeal}
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

      <DealFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingDeal(null)
        }}
        onSubmit={handleFormSubmit}
        deal={editingDeal}
        accounts={accounts}
        brands={brands}
      />

      <DeleteDealModal
        open={Boolean(deletingDeal)}
        onClose={() => setDeletingDeal(null)}
        onConfirm={handleDelete}
        dealTitle={deletingDeal?.title ?? ""}
      />
    </div>
  )
}
