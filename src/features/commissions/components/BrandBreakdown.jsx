import { Card } from "../../../components/ui/Card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table"
import { formatCurrency } from "../../../lib/format"

export function BrandBreakdown({ breakdown }) {
  if (breakdown.length === 0) return null

  return (
    <Card padding="md" className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-zinc-300">By Brand</h2>
        <p className="mt-0.5 text-xs text-zinc-600">Total, paid, and pending commissions per brand</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Pending</TableHead>
              <TableHead className="text-right">Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdown.map((row) => (
              <TableRow key={row.brandId}>
                <TableCell className="font-medium text-zinc-200">{row.brandName}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.total)}</TableCell>
                <TableCell className="text-right text-emerald-400">
                  {formatCurrency(row.paid)}
                </TableCell>
                <TableCell className="text-right text-amber-400">
                  {formatCurrency(row.pending)}
                </TableCell>
                <TableCell className="text-right text-zinc-500">{row.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
