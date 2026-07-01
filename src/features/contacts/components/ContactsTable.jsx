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
import { formatDate } from "../../../lib/format"
import { TYPE_VARIANTS } from "../constants"

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ArrowUpDown size={12} className="text-zinc-600" />
  return sortDir === "asc" ? (
    <ArrowUp size={12} className="text-indigo-400" />
  ) : (
    <ArrowDown size={12} className="text-indigo-400" />
  )
}

function SortableHead({ field, label, sortField, sortDir, onSort }) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1.5 transition-colors hover:text-zinc-300"
      >
        {label}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </button>
    </TableHead>
  )
}

export function ContactsTable({
  contacts,
  sortField,
  sortDir,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
  compact = false,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected = false,
  someSelected = false,
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected
                }}
                onChange={onToggleSelectAll}
                aria-label="Select all contacts"
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/50"
              />
            </TableHead>
          )}
          <SortableHead
            field="fullName"
            label="Name"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <TableHead>Company / Account</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <SortableHead
            field="lastContactDate"
            label="Last Contact"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <SortableHead
            field="nextFollowUpDate"
            label="Next Follow-up"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          {!compact && <TableHead className="w-24" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow
            key={contact.id}
            className={onRowClick ? "cursor-pointer" : undefined}
            onClick={onRowClick ? () => onRowClick(contact.id) : undefined}
          >
            {selectable && (
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedIds?.has(contact.id) ?? false}
                  onChange={() => onToggleSelect?.(contact.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${contact.fullName}`}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/50"
                />
              </TableCell>
            )}
            <TableCell className="font-medium text-zinc-200">{contact.fullName}</TableCell>
            <TableCell>{contact.companyDisplay}</TableCell>
            <TableCell>{contact.brandName ?? "—"}</TableCell>
            <TableCell>{contact.role || "—"}</TableCell>
            <TableCell>
              <Badge variant={TYPE_VARIANTS[contact.type] ?? "default"}>
                {contact.type}
              </Badge>
            </TableCell>
            <TableCell className="text-zinc-400">{contact.phone || "—"}</TableCell>
            <TableCell className="text-zinc-400">{contact.email || "—"}</TableCell>
            <TableCell>{formatDate(contact.lastContactDate)}</TableCell>
            <TableCell>{formatDate(contact.nextFollowUpDate)}</TableCell>
            {!compact && (
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Pencil}
                    aria-label="Edit contact"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(contact)
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Trash2}
                    aria-label="Delete contact"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(contact)
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
