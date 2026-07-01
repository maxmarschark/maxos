import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table"
import { Badge } from "../../../components/ui/Badge"
import { Button } from "../../../components/ui/Button"
import { formatCurrency, formatPercent } from "../../../lib/format"
import { STATUS_VARIANTS } from "../constants"
import { getActiveAccountCount } from "../utils"

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ArrowUpDown size={12} className="text-zinc-600" />
  return sortDir === "asc" ? (
    <ArrowUp size={12} className="text-indigo-400" />
  ) : (
    <ArrowDown size={12} className="text-indigo-400" />
  )
}

function SortableHead({ field, label, sortField, sortDir, onSort, align }) {
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 transition-colors hover:text-zinc-300 ${align === "right" ? "ml-auto" : ""}`}
      >
        {label}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </button>
    </TableHead>
  )
}

export function BrandsTable({
  brands,
  sortField,
  sortDir,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead
            field="brandName"
            label="Brand Name"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <SortableHead
            field="commissionDefault"
            label="Commission %"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            align="right"
          />
          <TableHead>Active Accounts</TableHead>
          <TableHead>Products</TableHead>
          <SortableHead
            field="monthlySales"
            label="Monthly Sales"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            align="right"
          />
          <SortableHead
            field="status"
            label="Status"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {brands.map((brand) => (
          <TableRow key={brand.id} onClick={() => onRowClick(brand.id)}>
            <TableCell>
              <div className="font-medium text-zinc-100">{brand.brandName}</div>
              {brand.mainContact && (
                <div className="text-xs text-zinc-600">{brand.mainContact}</div>
              )}
            </TableCell>
            <TableCell className="text-right font-medium text-indigo-400">
              {formatPercent(brand.commissionDefault)}
            </TableCell>
            <TableCell className="text-zinc-400">
              {getActiveAccountCount(brand.brandName)}
            </TableCell>
            <TableCell className="text-zinc-400">{brand.products.length}</TableCell>
            <TableCell className="text-right font-medium text-zinc-300">
              {formatCurrency(brand.monthlySales)}
            </TableCell>
            <TableCell>
              <Badge
                variant={STATUS_VARIANTS[brand.status] ?? "default"}
                className="normal-case tracking-normal"
              >
                {brand.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div
                className="flex items-center justify-end gap-1"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  icon={Pencil}
                  aria-label="Edit brand"
                  onClick={() => onEdit(brand)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  icon={Trash2}
                  aria-label="Delete brand"
                  className="hover:text-red-400"
                  onClick={() => onDelete(brand)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
