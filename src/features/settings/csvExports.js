import { rowsToCsv, downloadCsv, getDatedFileName } from "../../lib/csv"
import { loadAllAppData } from "../../lib/maxOsStorage"
import { buildCommissionRecords } from "../commissions/utils"

export function exportAccountsCsv() {
  const { accounts } = loadAllAppData()
  const headers = [
    "Business Name",
    "Owner",
    "Phone",
    "Email",
    "Address",
    "City",
    "State",
    "Website",
    "Brands Carried",
    "Outstanding Balance",
    "Last Visit",
    "Next Follow-up",
    "Tasks",
    "Notes",
  ]
  const rows = accounts.map((a) => [
    a.businessName,
    a.owner,
    a.phone,
    a.email,
    a.address,
    a.city,
    a.state,
    a.website,
    (a.brandsCarried ?? []).join("; "),
    a.outstandingBalance,
    a.lastVisit ?? "",
    a.nextFollowUp ?? "",
    a.tasks?.length ?? 0,
    a.notes?.length ?? 0,
  ])
  downloadCsv(rowsToCsv(headers, rows), getDatedFileName("max-os-accounts", "csv"))
}

export function exportContactsCsv() {
  const { contacts } = loadAllAppData()
  const headers = [
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
  downloadCsv(rowsToCsv(headers, rows), getDatedFileName("max-os-contacts", "csv"))
}

export function exportBrandsCsv() {
  const { brands } = loadAllAppData()
  const headers = [
    "Brand Name",
    "Description",
    "Website",
    "Main Contact",
    "Contact Email",
    "Contact Phone",
    "Commission Default %",
    "Status",
    "Monthly Sales",
    "Products",
    "Notes",
  ]
  const rows = brands.map((b) => [
    b.brandName,
    b.description,
    b.website,
    b.mainContact,
    b.contactEmail,
    b.contactPhone,
    b.commissionDefault,
    b.status,
    b.monthlySales,
    b.products?.length ?? 0,
    b.notes,
  ])
  downloadCsv(rowsToCsv(headers, rows), getDatedFileName("max-os-brands", "csv"))
}

export function exportOrdersCsv() {
  const { orders, accounts, brands } = loadAllAppData()
  const accountMap = new Map(accounts.map((a) => [a.id, a.businessName]))
  const brandMap = new Map(brands.map((b) => [b.id, b.brandName]))

  const headers = [
    "Order #",
    "Account",
    "Brand",
    "Order Date",
    "Order Amount",
    "Commission %",
    "Commission Amount",
    "Order Status",
    "Payment Status",
    "Payment Due Date",
    "Products / Notes",
    "Notes",
  ]
  const rows = orders.map((o) => [
    o.orderNumber,
    accountMap.get(o.accountId) ?? "",
    brandMap.get(o.brandId) ?? "",
    o.orderDate,
    o.orderAmount,
    o.commissionPercent,
    o.commissionAmount,
    o.orderStatus,
    o.paymentStatus,
    o.paymentDueDate ?? "",
    o.productsNotes,
    o.notes,
  ])
  downloadCsv(rowsToCsv(headers, rows), getDatedFileName("max-os-orders", "csv"))
}

export function exportCommissionsCsv() {
  const { orders, brands, accounts, commissions: storedMeta } = loadAllAppData()
  const records = buildCommissionRecords(orders, brands, accounts, storedMeta)

  const headers = [
    "Order #",
    "Account",
    "Brand",
    "Order Date",
    "Order Amount",
    "Commission %",
    "Commission Amount",
    "Status",
    "Due Date",
    "Paid Date",
    "Notes",
  ]
  const rows = records.map((c) => [
    c.orderNumber,
    c.accountName,
    c.brandName,
    c.orderDate,
    c.orderAmount,
    c.commissionPercent,
    c.commissionAmount,
    c.status,
    c.dueDate ?? "",
    c.paidDate ?? "",
    c.notes,
  ])
  downloadCsv(rowsToCsv(headers, rows), getDatedFileName("max-os-commissions", "csv"))
}
