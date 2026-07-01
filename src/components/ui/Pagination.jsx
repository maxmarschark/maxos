import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/cn"
import { Button } from "./Button"
import { Select } from "./Select"

const PAGE_SIZES = [10, 25, 50, 100]

export function Pagination({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
}) {
  if (totalItems === 0) return null

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-zinc-800/60 pt-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs text-zinc-500">
        Showing {rangeStart}–{rangeEnd} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <Select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 w-20 text-xs"
            aria-label="Rows per page"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            icon={ChevronLeft}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className="h-8 w-8"
          />
          <span className="min-w-[4.5rem] text-center text-xs text-zinc-400">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            icon={ChevronRight}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className="h-8 w-8"
          />
        </div>
      </div>
    </div>
  )
}
