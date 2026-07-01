import { PREFERRED_CONTACT_METHODS } from "./constants"
import {
  findAccountByName,
  findBrandByName,
  normalizeContactType,
} from "./utils"

const HEADER_MAP = {
  name: "name",
  "full name": "name",
  "first name": "firstName",
  firstname: "firstName",
  "last name": "lastName",
  lastname: "lastName",
  company: "company",
  account: "company",
  "company account": "company",
  "business name": "company",
  brand: "brand",
  role: "role",
  title: "role",
  "job title": "role",
  type: "type",
  phone: "phone",
  mobile: "phone",
  cell: "phone",
  email: "email",
  "e mail": "email",
  city: "city",
  state: "state",
  notes: "notes",
  note: "notes",
  "last contact": "lastContactDate",
  "last contact date": "lastContactDate",
  "next follow up": "nextFollowUpDate",
  "next follow up date": "nextFollowUpDate",
  "follow up": "nextFollowUpDate",
}

function normalizeHeader(header) {
  return header.toLowerCase().replace(/[_\-/]+/g, " ").replace(/\s+/g, " ").trim()
}

function parseCsvLine(line) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return { firstName: "", lastName: "" }
  if (parts.length === 1) return { firstName: parts[0], lastName: "" }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  }
}

function mapHeaders(headers) {
  return headers.map((h) => HEADER_MAP[normalizeHeader(h)] ?? null)
}

function parseDate(value) {
  if (!value?.trim()) return null
  const d = new Date(value.trim())
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export function parseCsvText(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim())

  if (lines.length === 0) {
    return { headers: [], mappedFields: [], rows: [], errors: ["CSV is empty."] }
  }

  const headers = parseCsvLine(lines[0])
  const mappedFields = mapHeaders(headers)
  const rows = []
  const errors = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    if (values.every((v) => !v.trim())) continue

    const row = {}
    mappedFields.forEach((field, idx) => {
      if (!field || !values[idx]) return
      row[field] = values[idx].trim()
    })

    if (row.name && !row.firstName) {
      const { firstName, lastName } = splitName(row.name)
      row.firstName = firstName
      row.lastName = lastName
      delete row.name
    }

    if (!row.firstName && !row.lastName && !row.email && !row.phone) {
      errors.push(`Row ${i + 1}: missing name and contact info — skipped.`)
      continue
    }

    rows.push(row)
  }

  return { headers, mappedFields, rows, errors }
}

export function rowsToContacts(rows, accounts, brands) {
  return rows.map((row) => {
    const account = findAccountByName(accounts, row.company)
    const brand = findBrandByName(brands, row.brand)

    return {
      firstName: row.firstName?.trim() ?? "",
      lastName: row.lastName?.trim() ?? "",
      accountId: account?.id ?? "",
      brandId: brand?.id ?? "",
      company: account ? "" : (row.company?.trim() ?? ""),
      role: row.role?.trim() ?? "",
      type: normalizeContactType(row.type),
      phone: row.phone?.trim() ?? "",
      email: row.email?.trim() ?? "",
      preferredContactMethod: PREFERRED_CONTACT_METHODS.includes(row.preferredContactMethod)
        ? row.preferredContactMethod
        : "Email",
      city: row.city?.trim() ?? "",
      state: row.state?.trim() ?? "TX",
      notes: row.notes?.trim() ?? "",
      lastContactDate: parseDate(row.lastContactDate),
      nextFollowUpDate: parseDate(row.nextFollowUpDate),
    }
  })
}
