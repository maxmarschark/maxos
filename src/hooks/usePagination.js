import { useMemo, useState } from "react"

const DEFAULT_PAGE_SIZE = 25

export function usePagination(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const [prevItemsLength, setPrevItemsLength] = useState(items.length)
  const [prevPageSize, setPrevPageSize] = useState(pageSize)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  if (items.length !== prevItemsLength || pageSize !== prevPageSize) {
    setPrevItemsLength(items.length)
    setPrevPageSize(pageSize)
    setPage(1)
  } else if (page > totalPages) {
    setPage(totalPages)
  }

  const safePage = Math.min(page, totalPages)

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, safePage, pageSize])

  return {
    page: safePage,
    setPage,
    pageSize,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    rangeStart: items.length === 0 ? 0 : (safePage - 1) * pageSize + 1,
    rangeEnd: Math.min(safePage * pageSize, items.length),
  }
}
