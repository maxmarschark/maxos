import { Pencil, FileText, CheckCircle, AlertTriangle } from "lucide-react"
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
import { formatCurrency, formatCurrencyDetailed, formatDate, formatPercent } from "../../../lib/format"
import { STATUS_VARIANTS } from "../constants"

export function CommissionsTable({
  commissions,
  onEdit,
  onMarkInvoiced,
  onMarkPaid,
  onMarkDisputed,
}) {
  return (
    <Table maxHeight="70vh">
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead className="text-right">Order Amount</TableHead>
          <TableHead className="text-right">Commission %</TableHead>
          <TableHead className="text-right">Commission $</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Paid Date</TableHead>
          <TableHead className="w-36" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {commissions.map((commission) => (
          <TableRow key={commission.orderId}>
            <TableCell className="font-medium text-zinc-200">
              #{commission.orderNumber}
            </TableCell>
            <TableCell>{commission.accountName}</TableCell>
            <TableCell>{commission.brandName}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(commission.orderAmount)}
            </TableCell>
            <TableCell className="text-right">
              {formatPercent(commission.commissionPercent)}
            </TableCell>
            <TableCell className="text-right">
              <span className={commission.amountManual ? "text-amber-400" : undefined}>
                {formatCurrencyDetailed(commission.commissionAmount)}
              </span>
              {commission.amountManual && (
                <span className="ml-1 text-xs text-zinc-600">override</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[commission.status] ?? "default"}>
                {commission.status}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(commission.dueDate)}</TableCell>
            <TableCell>{formatDate(commission.paidDate)}</TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-0.5">
                {commission.status !== "Invoiced" && commission.status !== "Paid" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={FileText}
                    aria-label="Mark as invoiced"
                    title="Mark as Invoiced"
                    onClick={() => onMarkInvoiced(commission.orderId)}
                  />
                )}
                {commission.status !== "Paid" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={CheckCircle}
                    aria-label="Mark as paid"
                    title="Mark as Paid"
                    onClick={() => onMarkPaid(commission.orderId)}
                  />
                )}
                {commission.status !== "Disputed" && commission.status !== "Paid" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={AlertTriangle}
                    aria-label="Mark as disputed"
                    title="Mark as Disputed"
                    onClick={() => onMarkDisputed(commission.orderId)}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  icon={Pencil}
                  aria-label="Edit commission"
                  onClick={() => onEdit(commission)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
