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

function filterAndSort(brands, { search, sortField, sortDir }) {
  let result = [...brands]

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (b) =>
        b.brandName.toLowerCase().includes(q) ||
        b.mainContact.toLowerCase().includes(q) ||
        b.contactEmail.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    )
  }

  result.sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (sortField === "commissionDefault" || sortField === "monthlySales") {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
    } else {
      aVal = String(aVal ?? "").toLowerCase()
      bVal = String(bVal ?? "").toLowerCase()
    }

    if (aVal < bVal) return sortDir === "asc" ? -1 : 1
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1
    return 0
  })

  return result
}

export function BrandsPage() {
  const navigate = useNavigate()
  const { brands, addBrand, updateBrand, deleteBrand } = useBrands()

  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState("brandName")
  const [sortDir, setSortDir] = useState("asc")
  const [formOpen, setFormOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [deletingBrand, setDeletingBrand] = useState(null)

  const filtered = useMemo(
    () => filterAndSort(brands, { search, sortField, sortDir }),
    [brands, search, sortField, sortDir]
  )

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function handleAdd() {
    setEditingBrand(null)
    setFormOpen(true)
  }

  function handleEdit(brand) {
    setEditingBrand(brand)
    setFormOpen(true)
  }

  function handleFormSubmit(data) {
    if (editingBrand) {
      updateBrand(editingBrand.id, data)
    } else {
      addBrand(data)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            Brands
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {brands.length} brand partner{brands.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={handleAdd}>
          Add Brand
        </Button>
      </div>

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
        <BrandsTable
          brands={filtered}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={(id) => navigate(`/brands/${id}`)}
          onEdit={handleEdit}
          onDelete={setDeletingBrand}
        />
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
        onConfirm={() => deleteBrand(deletingBrand.id)}
        brandName={deletingBrand?.brandName ?? ""}
      />
    </div>
  )
}
