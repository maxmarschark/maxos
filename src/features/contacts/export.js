import { getContactName } from "./utils"

const EXPORT_HEADERS = [
  "First Name",
  "Last Name",
  "Company",
  "Account",
  "Brand",
  "Role",
  "Type",
  "Phone",
  "Email",
  "Preferred Contact Method",
  "City",
  "State",
  "Last Contact Date",
  "Next Follow-up Date",
  "Notes",
]

function escapeCsvValue(value) {
  const str = String(value ?? "")
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function contactsToCsv(contacts) {
  const rows = contacts.map((c) => [
    c.firstName,
    c.lastName,
    c.company,
    c.accountName ?? "",
    c.brandName ?? "",
    c.role,
    c.type,
    c.phone,
    c.email,
    c.preferredContactMethod,
    c.city,
    c.state,
    c.lastContactDate ?? "",
    c.nextFollowUpDate ?? "",
    c.notes,
  ])

  const lines = [
    EXPORT_HEADERS.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ]

  return lines.join("\n")
}

export function downloadContactsCsv(contacts, fileName = "contacts-export.csv") {
  const csv = contactsToCsv(contacts)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export function getExportFileName() {
  const date = new Date().toISOString().slice(0, 10)
  return `max-os-contacts-${date}.csv`
}

export function getContactDisplayName(contact) {
  return getContactName(contact)
}
