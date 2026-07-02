export function sortRows(rows, sortConfig, getValue) {
  if (!sortConfig?.key) return rows
  return [...rows].sort((a, b) => {
    const aValue = getValue(a, sortConfig.key)
    const bValue = getValue(b, sortConfig.key)
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "desc" ? bValue - aValue : aValue - bValue
    }
    return sortConfig.direction === "desc"
      ? String(bValue).localeCompare(String(aValue))
      : String(aValue).localeCompare(String(bValue))
  })
}

export function getTableSortValue(row, key, fieldTypes = {}) {
  const type = fieldTypes[key]
  const val = row[key]
  if (type === "number") return Number(val) || 0
  if (type === "date") return val ? new Date(val).getTime() : null
  return val ?? null
}

export function sortRowsByField(rows, sortField, sortDir, fieldTypes = {}) {
  return sortRows(
    rows,
    { key: sortField, direction: sortDir },
    (row, key) => getTableSortValue(row, key, fieldTypes)
  )
}
