import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { TableHead } from "./Table"
import { cn } from "../../lib/cn"

export function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) {
    return <ArrowUpDown size={12} className="text-zinc-600" />
  }
  return sortDir === "asc" ? (
    <ArrowUp size={12} className="text-indigo-400" />
  ) : (
    <ArrowDown size={12} className="text-indigo-400" />
  )
}

export function SortableHead({
  field,
  label,
  sortField,
  sortDir,
  onSort,
  className,
  resizable = false,
  align,
}) {
  return (
    <TableHead
      className={cn(
        resizable && "relative min-w-[120px]",
        align === "right" && "text-right",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex w-full items-center gap-1.5 text-left transition-colors hover:text-zinc-300",
          align === "right" && "justify-end text-right"
        )}
      >
        {label}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </button>
      {resizable && (
        <span
          aria-hidden
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-500/40"
        />
      )}
    </TableHead>
  )
}
