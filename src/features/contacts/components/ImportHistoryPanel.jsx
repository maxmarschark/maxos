import { Trash2 } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table"
import { formatDate } from "../../../lib/format"

export function ImportHistoryPanel({ batches, onDeleteBatch }) {
  if (batches.length === 0) return null

  return (
    <Card padding="md" className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-zinc-300">Import History</h2>
        <p className="mt-0.5 text-xs text-zinc-600">
          Each CSV import is tracked as a batch. Delete a batch to remove all contacts from that
          import.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead className="text-right">Contacts</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{formatDate(batch.importedAt)}</TableCell>
                <TableCell className="text-zinc-300">{batch.fileName}</TableCell>
                <TableCell className="text-right">{batch.contactCount}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Trash2}
                    aria-label={`Delete import batch ${batch.fileName}`}
                    onClick={() => onDeleteBatch(batch.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
