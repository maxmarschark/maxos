import { useCallback, useState } from "react"

export function useTableSort(initialField, initialDir = "asc") {
  const [sortField, setSortField] = useState(initialField)
  const [sortDir, setSortDir] = useState(initialDir)

  const handleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      } else {
        setSortField(field)
        setSortDir("asc")
      }
    },
    [sortField]
  )

  return { sortField, sortDir, handleSort, setSortField, setSortDir }
}
