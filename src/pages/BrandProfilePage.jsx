import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useBrands } from "../features/brands/useBrands"
import { BrandFormModal } from "../features/brands/components/BrandFormModal"
import { DeleteBrandModal } from "../features/brands/components/DeleteBrandModal"
import { Tabs } from "../components/ui/Tabs"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { formatCurrency, formatPercent } from "../lib/format"
import { STATUS_VARIANTS } from "../features/brands/constants"
import { getActiveAccountCount } from "../features/brands/utils"
import { OverviewTab } from "../features/brands/components/tabs/OverviewTab"
import { ProductsTab } from "../features/brands/components/tabs/ProductsTab"
import { AccountsTab } from "../features/brands/components/tabs/AccountsTab"
import { BrandOrdersTab } from "../features/orders/components/BrandOrdersTab"
import { useOrders } from "../features/orders/useOrders"
import { useCommissions } from "../features/commissions/useCommissions"
import { getBrandMetrics } from "../lib/relationships"
import { BrandContactsTab } from "../features/contacts/components/BrandContactsTab"
import { useContacts } from "../features/contacts/useContacts"
import { NotesTab } from "../features/brands/components/tabs/NotesTab"
import { AssetsTab } from "../features/brand-files/components/AssetsTab"
import { useBrandFiles } from "../features/brand-files/useBrandFiles"

export function BrandProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getBrand,
    updateBrand,
    deleteBrand,
    addNoteEntry,
    deleteNoteEntry,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useBrands()
  const { getOrdersByBrand, orders } = useOrders()
  const { commissions } = useCommissions()
  const { getContactsByBrand } = useContacts()

  const brand = getBrand(id)
  const { files: brandFiles } = useBrandFiles(id)
  const metrics = useMemo(
    () => (brand ? getBrandMetrics(brand.id, orders, commissions) : null),
    [brand, orders, commissions]
  )
  const [activeTab, setActiveTab] = useState("overview")
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!brand) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-zinc-200">Brand not found</h2>
        <p className="mt-2 text-sm text-zinc-500">This brand may have been deleted.</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => navigate("/brands")}
        >
          Back to Brands
        </Button>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "products", label: "Products", count: brand.products.length },
    { id: "accounts", label: "Accounts", count: getActiveAccountCount(brand.brandName) },
    { id: "orders", label: "Orders", count: getOrdersByBrand(brand.id).length },
    { id: "contacts", label: "Contacts", count: getContactsByBrand(brand.id).length },
    { id: "assets", label: "Assets", count: brandFiles.length },
    { id: "notes", label: "Notes", count: brand.noteEntries.length + (brand.notes ? 1 : 0) },
  ]

  function handleDelete() {
    deleteBrand(brand.id)
    navigate("/brands")
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/brands")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft size={14} />
          Back to Brands
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                {brand.brandName}
              </h1>
              <Badge
                variant={STATUS_VARIANTS[brand.status]}
                className="normal-case tracking-normal"
              >
                {brand.status}
              </Badge>
              <Badge variant="primary" className="normal-case tracking-normal">
                {formatPercent(brand.commissionDefault)} commission
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {brand.mainContact && `${brand.mainContact} · `}
              {formatCurrency(brand.monthlySales)}/mo · {brand.products.length} products
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="hover:text-red-400"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === "overview" && <OverviewTab brand={brand} metrics={metrics} />}
        {activeTab === "products" && (
          <ProductsTab
            brand={brand}
            onAddProduct={(data) => addProduct(brand.id, data)}
            onUpdateProduct={(productId, data) => updateProduct(brand.id, productId, data)}
            onDeleteProduct={(productId) => deleteProduct(brand.id, productId)}
          />
        )}
        {activeTab === "accounts" && <AccountsTab brandName={brand.brandName} />}
        {activeTab === "orders" && <BrandOrdersTab brandId={brand.id} />}
        {activeTab === "contacts" && <BrandContactsTab brandId={brand.id} />}
        {activeTab === "assets" && <AssetsTab brandId={brand.id} brandName={brand.brandName} />}
        {activeTab === "notes" && (
          <NotesTab
            brand={brand}
            onAddNote={(content) => addNoteEntry(brand.id, content)}
            onDeleteNote={(noteId) => deleteNoteEntry(brand.id, noteId)}
          />
        )}
      </div>

      <BrandFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => updateBrand(brand.id, data)}
        brand={brand}
      />

      <DeleteBrandModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        brandName={brand.brandName}
      />
    </div>
  )
}
