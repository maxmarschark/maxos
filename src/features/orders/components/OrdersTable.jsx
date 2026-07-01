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
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatDate,
  formatPercent,
} from "../../../lib/format"
import { ORDER_STATUS_VARIANTS, PAYMENT_STATUS_VARIANTS } from "../constants"

export function OrdersTable({
  orders,
  sortField,
  sortDir,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
  compact = false,
}) {
  return (
    <Table maxHeight="70vh">
      <TableHeader>
        <TableRow>
          <SortableHead
            field="orderNumber"
            label="Order #"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <TableHead>Account</TableHead>
          <TableHead>Brand</TableHead>
          <SortableHead
            field="orderDate"
            label="Order Date"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <SortableHead
            field="orderAmount"
            label="Amount"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            align="right"
          />
          <SortableHead
            field="commissionPercent"
            label="Commission %"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            align="right"
          />
          <TableHead className="text-right">Commission $</TableHead>
          <TableHead>Payment Status</TableHead>
          <SortableHead
            field="orderStatus"
            label="Order Status"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          {!compact && <TableHead className="w-24" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className={onRowClick ? "cursor-pointer" : undefined}
            onClick={onRowClick ? () => onRowClick(order.id) : undefined}
          >
            <TableCell className="font-medium text-zinc-200">#{order.orderNumber}</TableCell>
            <TableCell>
              <EntityLink
                to={`/accounts/${order.accountId}`}
                onClick={onRowClick ? (e) => e.stopPropagation() : undefined}
              >
                {order.accountName}
              </EntityLink>
            </TableCell>
            <TableCell>
              <EntityLink
                to={`/brands/${order.brandId}`}
                onClick={onRowClick ? (e) => e.stopPropagation() : undefined}
              >
                {order.brandName}
              </EntityLink>
            </TableCell>
            <TableCell>{formatDate(order.orderDate)}</TableCell>
            <TableCell className="text-right">{formatCurrency(order.orderAmount)}</TableCell>
            <TableCell className="text-right">{formatPercent(order.commissionPercent)}</TableCell>
            <TableCell className="text-right">
              {formatCurrencyDetailed(order.commissionAmount)}
            </TableCell>
            <TableCell>
              <Badge variant={PAYMENT_STATUS_VARIANTS[order.paymentStatus] ?? "default"}>
                {order.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={ORDER_STATUS_VARIANTS[order.orderStatus] ?? "default"}>
                {order.orderStatus}
              </Badge>
            </TableCell>
            {!compact && (
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Pencil}
                    aria-label="Edit order"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(order)
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Trash2}
                    aria-label="Delete order"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(order)
                    }}
                  />
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
