import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table"
import { SortableHead } from "../../../components/ui/SortableTable"
import { Badge } from "../../../components/ui/Badge"
import { Button } from "../../../components/ui/Button"
import { EntityLink } from "../../../components/ui/EntityLink"
import { formatCurrency } from "../../../lib/format"
import { STAGE_VARIANTS } from "../constants"

export function DealsTable({
  deals,
  sortField,
  sortDir,
  onSort,
  onEdit,
  onDelete,
}) {
  return (
    <Table maxHeight="70vh">
      <TableHeader>
        <TableRow>
          <SortableHead
            field="title"
            label="Title"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <TableHead>Account</TableHead>
          <TableHead>Brand</TableHead>
          <SortableHead
            field="stage"
            label="Stage"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <SortableHead
            field="value"
            label="Value"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            align="right"
          />
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal) => (
          <TableRow key={deal.id}>
            <TableCell>
              <div className="font-medium text-zinc-100">{deal.title}</div>
              {deal.notes && (
                <div className="max-w-xs truncate text-xs text-zinc-600">{deal.notes}</div>
              )}
            </TableCell>
            <TableCell>
              {deal.accountId ? (
                <EntityLink
                  to={`/accounts/${deal.accountId}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {deal.accountName || "—"}
                </EntityLink>
              ) : (
                <span className="text-zinc-500">—</span>
              )}
            </TableCell>
            <TableCell>
              {deal.brandId ? (
                <EntityLink
                  to={`/brands/${deal.brandId}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {deal.brandName || "—"}
                </EntityLink>
              ) : (
                <span className="text-zinc-500">—</span>
              )}
            </TableCell>
            <TableCell>
              <Badge
                variant={STAGE_VARIANTS[deal.stage] ?? "default"}
                className="normal-case tracking-normal"
              >
                {deal.stage}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium text-zinc-300">
              {formatCurrency(deal.value)}
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
                  aria-label="Edit deal"
                  onClick={() => onEdit(deal)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  icon={Trash2}
                  aria-label="Delete deal"
                  className="hover:text-red-400"
                  onClick={() => onDelete(deal)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
