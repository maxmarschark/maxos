import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Tags, Plus } from "lucide-react"
import { useBrands } from "../features/brands/useBrands"
import { BrandsTable } from "../features/brands/components/BrandsTable"
import { BrandFormModal } from "../features/brands/components/BrandFormModal"
import { DeleteBrandModal } from "../features/brands/components/DeleteBrandModal"
import { Button } from "../components/ui/Button"
import { SearchInput } from "../components/ui/SearchInput"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { StorageModeBadge } from "../components/ui/StorageModeBadge"
import { Pagination } from "../components/ui/Pagination"
import { useToast } from "../components/ui/useToast"
import { usePagination } from "../hooks/usePagination"
import { useTableSort } from "../hooks/useTableSort"
import { handleCloudSave } from "../lib/handleCloudSave"

function filterBrands(brands, { search }) {
  if (!search.trim()) return [...brands]
  const q = search.toLowerCase()
  return brands.filter(
    (b) =>
      b.brandName.toLowerCase().includes(q) ||
      b.mainContact.toLowerCase().includes(q) ||
      b.contactEmail.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q)
  )
}

const SORT_FIELD_TYPES = {
  commissionDefault: "number",
  monthlySales: "number",
}

export function BrandsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { brands, storageMode, addBrand, updateBrand, deleteBrand } = useBrands()

  const [search, setSearch] = useState("")
  const { sortField, sortDir, handleSort } = useTableSort("brandName", "asc")
  const [pageSize, setPageSize] = useState(25)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [deletingBrand, setDeletingBrand] = useState(null)

  const filtered = useMemo(() => {
    const rows = filterBrands(brands, { search })
    return sortRows(rows, sortField, sortDir, SORT_FIELD_TYPES)
  }, [brands, search, sortField, sortDir])

  const pagination = usePagination(filtered, pageSize)

  function handleAdd() {
    setEditingBrand(null)
    setFormOpen(true)
  }

  function handleEdit(brand) {
    setEditingBrand(brand)
    setFormOpen(true)
  }

  async function handleFormSubmit(data) {
    if (editingBrand) {
      await handleCloudSave(() => updateBrand(editingBrand.id, data), {
        onSuccess: () => toast(`Updated ${data.brandName}`),
        onError: () => toast("Failed to update brand", "error"),
      })
    } else {
      await handleCloudSave(() => addBrand(data), {
        onSuccess: () => toast(`Added ${data.brandName}`),
        onError: () => toast("Failed to add brand", "error"),
      })
    }
  }

  async function handleDelete() {
    const ok = await handleCloudSave(() => deleteBrand(deletingBrand.id), {
      onError: () => toast("Failed to delete brand", "error"),
    })
    if (!ok) return
    toast(`Deleted ${deletingBrand.brandName}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Tags}
        title="Brands"
        description={`${brands.length} brand partner${brands.length !== 1 ? "s" : ""}`}
        badge={<StorageModeBadge mode={storageMode} />}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleAdd}>
            Add Brand
          </Button>
        }
      />

      <SearchInput
        className="max-w-md"
        placeholder="Search brands..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={Tags}
            title={brands.length === 0 ? "No brands yet" : "No matching brands"}
            description={
              brands.length === 0
                ? "Add your first brand partner to get started."
                : "Try adjusting your search."
            }
            actionLabel={brands.length === 0 ? "Add Brand" : undefined}
            onAction={brands.length === 0 ? handleAdd : undefined}
          />
        </Card>
      ) : (
        <>
          <BrandsTable
            brands={pagination.paginatedItems}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={(id) => navigate(`/brands/${id}`)}
            onEdit={handleEdit}
            onDelete={setDeletingBrand}
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

      <BrandFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingBrand(null)
        }}
        onSubmit={handleFormSubmit}
        brand={editingBrand}
      />

      <DeleteBrandModal
        open={Boolean(deletingBrand)}
        onClose={() => setDeletingBrand(null)}
        onConfirm={handleDelete}
        brandName={deletingBrand?.brandName ?? ""}
      />
    </div>
  )
}
