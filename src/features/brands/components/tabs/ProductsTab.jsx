import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/Table"
import { Card } from "../../../../components/ui/Card"
import { Button } from "../../../../components/ui/Button"
import { Badge } from "../../../../components/ui/Badge"
import { EmptyState } from "../../../../components/ui/EmptyState"
import { formatCurrencyDetailed, formatPercent } from "../../../../lib/format"
import { ProductFormModal } from "../ProductFormModal"
import { DeleteProductModal } from "../DeleteProductModal"

export function ProductsTab({ brand, onAddProduct, onUpdateProduct, onDeleteProduct }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)

  function handleAdd() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function handleEdit(product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  function handleSubmit(data) {
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, data)
    } else {
      onAddProduct(data)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {brand.products.length} product{brand.products.length !== 1 ? "s" : ""} in catalog
        </p>
        <Button variant="primary" size="sm" icon={Plus} onClick={handleAdd}>
          Add Product
        </Button>
      </div>

      {brand.products.length === 0 ? (
        <Card padding="none">
          <EmptyState
            title="No products yet"
            description="Add products to build this brand's catalog."
            actionLabel="Add Product"
            onAction={handleAdd}
          />
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Dist. Price</TableHead>
              <TableHead className="text-right">Wholesale</TableHead>
              <TableHead className="text-right">MSRP</TableHead>
              <TableHead className="text-right">Comm. %</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {brand.products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium text-zinc-200">{product.productName}</div>
                  {product.notes && (
                    <div className="mt-0.5 max-w-[200px] truncate text-xs text-zinc-600">
                      {product.notes}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-zinc-500">{product.sku}</TableCell>
                <TableCell>
                  {product.category ? (
                    <Badge variant="default" className="normal-case tracking-normal">
                      {product.category}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right text-zinc-400">
                  {formatCurrencyDetailed(product.distributorPrice)}
                </TableCell>
                <TableCell className="text-right text-zinc-400">
                  {formatCurrencyDetailed(product.wholesalePrice)}
                </TableCell>
                <TableCell className="text-right text-zinc-300">
                  {formatCurrencyDetailed(product.msrp)}
                </TableCell>
                <TableCell className="text-right text-indigo-400">
                  {product.commissionOverride != null
                    ? formatPercent(product.commissionOverride)
                    : formatPercent(brand.commissionDefault)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      icon={Pencil}
                      aria-label="Edit product"
                      onClick={() => handleEdit(product)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      icon={Trash2}
                      aria-label="Delete product"
                      className="hover:text-red-400"
                      onClick={() => setDeletingProduct(product)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ProductFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingProduct(null)
        }}
        onSubmit={handleSubmit}
        product={editingProduct}
      />

      <DeleteProductModal
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => onDeleteProduct(deletingProduct.id)}
        productName={deletingProduct?.productName ?? ""}
      />
    </div>
  )
}
