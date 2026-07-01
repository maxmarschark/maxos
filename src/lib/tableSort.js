export function compareValues(aVal, bVal, sortDir) {
  if (aVal < bVal) return sortDir === "asc" ? -1 : 1
  if (aVal > bVal) return sortDir === "asc" ? 1 : -1
  return 0
}

export function sortRows(rows, sortField, sortDir, fieldTypes = {}) {
  const result = [...rows]
  const type = fieldTypes[sortField] ?? "string"

  result.sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (type === "number") {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
    } else if (type === "date") {
      aVal = aVal ? new Date(aVal).getTime() : 0
      bVal = bVal ? new Date(bVal).getTime() : 0
    } else {
      aVal = String(aVal ?? "").toLowerCase()
      bVal = String(bVal ?? "").toLowerCase()
    }

    return compareValues(aVal, bVal, sortDir)
  })

  return result
}
