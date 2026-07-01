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
import { formatCurrency, formatDate } from "../../../lib/format"
import { cn } from "../../../lib/cn"

export function AccountsTable({
  accounts,
  sortField,
  sortDir,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
}) {
  return (
    <Table maxHeight="70vh">
      <TableHeader>
        <TableRow>
          <SortableHead
            field="businessName"
            label="Business"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <TableHead>Owner</TableHead>
          <SortableHead
            field="state"
            label="State"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <TableHead>Brands</TableHead>
          <SortableHead
            field="outstandingBalance"
            label="Balance"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            align="right"
          />
          <SortableHead
            field="lastVisit"
            label="Last Visit"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <SortableHead
            field="nextFollowUp"
            label="Follow-up"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id} onClick={() => onRowClick(account.id)}>
            <TableCell>
              <div className="font-medium text-zinc-100">{account.businessName}</div>
              <div className="text-xs text-zinc-600">
                {account.city}
                {account.city && account.state ? ", " : ""}
                {account.state}
              </div>
            </TableCell>
            <TableCell className="text-zinc-400">{account.owner || "—"}</TableCell>
            <TableCell>
              <Badge variant="default" className="normal-case tracking-normal">
                {account.state}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex max-w-[160px] flex-wrap gap-1">
                {account.brandsCarried.slice(0, 2).map((brand) => (
                  <Badge
                    key={brand}
                    variant="primary"
                    className="normal-case tracking-normal"
                  >
                    {brand}
                  </Badge>
                ))}
                {account.brandsCarried.length > 2 && (
                  <Badge variant="default" className="normal-case tracking-normal">
                    +{account.brandsCarried.length - 2}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-medium",
                account.outstandingBalance > 0 ? "text-red-400" : "text-zinc-500"
              )}
            >
              {formatCurrency(account.outstandingBalance)}
            </TableCell>
            <TableCell className="text-zinc-500">{formatDate(account.lastVisit)}</TableCell>
            <TableCell className="text-zinc-500">
              {formatDate(account.nextFollowUp)}
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
                  aria-label="Edit account"
                  onClick={() => onEdit(account)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  icon={Trash2}
                  aria-label="Delete account"
                  className="hover:text-red-400"
                  onClick={() => onDelete(account)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
