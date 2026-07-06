import { buildCommissionRecords } from "../../features/commissions/utils"
import { buildActivityTimeline, buildRelationshipContext } from "../relationships"

function resolveContactNameForSupabase(contact) {
  const fullName = String(contact.fullName ?? contact.name ?? "").trim()
  if (fullName) return fullName

  const firstName = String(contact.firstName ?? "").trim()
  const lastName = String(contact.lastName ?? "").trim()
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName

  const company = String(contact.company ?? "").trim()
  if (company) return company

  const email = String(contact.email ?? "").trim()
  if (email) return email

  return "Unknown Contact"
}

function toNullable(value) {
  if (value === "" || value === undefined) return null
  return value
}

function toDate(value) {
  const v = toNullable(value)
  if (!v) return null
  return v.slice(0, 10)
}

function toTimestamp(value) {
  const v = toNullable(value)
  if (!v) return null
  return v
}

export function parseAccountRow(row) {
  return {
    id: row.id,
    businessName: row.business_name ?? "",
    owner: row.owner ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    website: row.website ?? "",
    brandsCarried: row.brands_carried ?? [],
    outstandingBalance: Number(row.outstanding_balance) || 0,
    lastVisit: row.last_visit ?? null,
    nextFollowUp: row.next_follow_up ?? null,
    notes: Array.isArray(row.notes) ? row.notes : [],
    tasks: Array.isArray(row.legacy_tasks) ? row.legacy_tasks : [],
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

export function transformAccount(account, userId) {
  return {
    id: account.id,
    ...(userId ? { user_id: userId } : {}),
    business_name: account.businessName ?? "",
    owner: account.owner ?? "",
    phone: account.phone ?? "",
    email: account.email ?? "",
    address: account.address ?? "",
    city: account.city ?? "",
    state: account.state ?? "",
    website: account.website ?? "",
    brands_carried: account.brandsCarried ?? [],
    outstanding_balance: Number(account.outstandingBalance) || 0,
    last_visit: toDate(account.lastVisit),
    next_follow_up: toDate(account.nextFollowUp),
    notes: account.notes ?? [],
    legacy_tasks: account.tasks ?? [],
    created_at: toTimestamp(account.createdAt),
    updated_at: toTimestamp(account.updatedAt),
  }
}

export function transformBrand(brand, userId) {
  return {
    id: brand.id,
    ...(userId ? { user_id: userId } : {}),
    brand_name: brand.brandName ?? "",
    description: brand.description ?? "",
    website: brand.website ?? "",
    main_contact: brand.mainContact ?? "",
    contact_email: brand.contactEmail ?? "",
    contact_phone: brand.contactPhone ?? "",
    commission_default: Number(brand.commissionDefault) || 0,
    status: brand.status ?? "Active",
    notes: brand.notes ?? "",
    monthly_sales: Number(brand.monthlySales) || 0,
    note_entries: brand.noteEntries ?? [],
    created_at: toTimestamp(brand.createdAt),
    updated_at: toTimestamp(brand.updatedAt),
  }
}

export function transformBrandProducts(brands, userId) {
  const rows = []
  for (const brand of brands) {
    for (const product of brand.products ?? []) {
      rows.push(transformBrandProduct(product, brand.id, userId))
    }
  }
  return rows
}

export function transformDeal(deal, userId) {
  return {
    id: deal.id,
    ...(userId ? { user_id: userId } : {}),
    title: deal.title ?? "",
    account_id: toNullable(deal.accountId),
    brand_id: toNullable(deal.brandId),
    stage: deal.stage ?? "Prospect",
    value: Number(deal.value) || 0,
    notes: deal.notes ?? "",
    created_at: toTimestamp(deal.createdAt),
    updated_at: toTimestamp(deal.updatedAt),
  }
}

export function transformCalendarEvent(event, userId) {
  return {
    id: event.id,
    ...(userId ? { user_id: userId } : {}),
    title: event.title ?? "",
    event_date: toDate(event.eventDate),
    event_time: event.eventTime ?? "",
    event_type: event.eventType ?? "Meeting",
    account_id: toNullable(event.accountId),
    contact_id: toNullable(event.contactId),
    notes: event.notes ?? "",
    created_at: toTimestamp(event.createdAt),
    updated_at: toTimestamp(event.updatedAt),
  }
}

export function parseBrandRow(row, products = []) {
  return {
    id: row.id,
    brandName: row.brand_name ?? "",
    description: row.description ?? "",
    website: row.website ?? "",
    mainContact: row.main_contact ?? "",
    contactEmail: row.contact_email ?? "",
    contactPhone: row.contact_phone ?? "",
    commissionDefault: Number(row.commission_default) || 0,
    status: row.status ?? "Active",
    notes: row.notes ?? "",
    monthlySales: Number(row.monthly_sales) || 0,
    noteEntries: Array.isArray(row.note_entries) ? row.note_entries : [],
    products: (products ?? []).map(normalizeBrandProduct),
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

function isAppBrandProduct(row) {
  return (
    row &&
    (Object.prototype.hasOwnProperty.call(row, "productName") ||
      Object.prototype.hasOwnProperty.call(row, "distributorPrice") ||
      Object.prototype.hasOwnProperty.call(row, "wholesalePrice")) &&
    !Object.prototype.hasOwnProperty.call(row, "product_name")
  )
}

/** Normalizes a brand product from either Supabase row or in-app shape. */
export function normalizeBrandProduct(row) {
  if (!row) {
    return {
      id: "",
      brandId: "",
      productName: "",
      sku: "",
      category: "",
      distributorPrice: 0,
      wholesalePrice: 0,
      msrp: 0,
      commissionOverride: null,
      notes: "",
    }
  }

  if (isAppBrandProduct(row)) {
    return {
      id: row.id,
      brandId: row.brandId ?? "",
      productName: row.productName ?? "",
      sku: row.sku ?? "",
      category: row.category ?? "",
      distributorPrice: Number(row.distributorPrice) || 0,
      wholesalePrice: Number(row.wholesalePrice) || 0,
      msrp: Number(row.msrp) || 0,
      commissionOverride:
        row.commissionOverride === null || row.commissionOverride === undefined
          ? null
          : Number(row.commissionOverride),
      notes: row.notes ?? "",
    }
  }

  return parseBrandProductRow(row)
}

export function parseBrandProductRow(row) {
  return {
    id: row.id,
    brandId: row.brand_id ?? row.brandId ?? "",
    productName: row.product_name ?? row.productName ?? row.name ?? "",
    sku: row.sku ?? "",
    category: row.category ?? "",
    distributorPrice: Number(row.distributor_price ?? row.distributorPrice) || 0,
    wholesalePrice: Number(row.wholesale_price ?? row.wholesalePrice) || 0,
    msrp: Number(row.msrp) || 0,
    commissionOverride:
      row.commission_override === null || row.commission_override === undefined
        ? row.commissionOverride === null || row.commissionOverride === undefined
          ? null
          : Number(row.commissionOverride)
        : Number(row.commission_override),
    notes: row.notes ?? "",
  }
}

export function transformBrandProduct(product, brandId, userId) {
  const normalized = normalizeBrandProduct(product)
  return {
    id: normalized.id,
    brand_id: brandId,
    ...(userId ? { user_id: userId } : {}),
    product_name: normalized.productName,
    sku: normalized.sku,
    category: normalized.category,
    distributor_price: normalized.distributorPrice,
    wholesale_price: normalized.wholesalePrice,
    msrp: normalized.msrp,
    commission_override: normalized.commissionOverride,
    notes: normalized.notes,
  }
}

export function parseContactRow(row) {
  const dbName = row.name?.trim() ?? ""
  let firstName = row.first_name ?? ""
  let lastName = row.last_name ?? ""
  if (!firstName && !lastName && dbName) {
    const parts = dbName.split(/\s+/)
    firstName = parts[0] ?? ""
    lastName = parts.slice(1).join(" ")
  }

  return {
    id: row.id,
    name: dbName,
    firstName,
    lastName,
    accountId: row.account_id ?? "",
    brandId: row.brand_id ?? "",
    company: row.company ?? "",
    role: row.role ?? "",
    type: row.type ?? "Buyer",
    phone: row.phone ?? "",
    email: row.email ?? "",
    preferredContactMethod: row.preferred_contact_method ?? "Call",
    city: row.city ?? "",
    state: row.state ?? "",
    notes: row.notes ?? "",
    lastContactDate: row.last_contact_date ?? null,
    nextFollowUpDate: row.next_follow_up_date ?? null,
    importBatchId: row.import_batch_id ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

export function parseOrderRow(row) {
  return {
    id: row.id,
    orderNumber: row.order_number ?? "",
    accountId: row.account_id ?? "",
    brandId: row.brand_id ?? "",
    orderDate: row.order_date ?? null,
    productsNotes: row.products_notes ?? "",
    orderAmount: Number(row.order_amount) || 0,
    commissionPercent: Number(row.commission_percent) || 0,
    commissionAmount: Number(row.commission_amount) || 0,
    orderStatus: row.order_status ?? "Draft",
    paymentStatus: row.payment_status ?? "Unpaid",
    paymentDueDate: row.payment_due_date ?? null,
    notes: row.notes ?? "",
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

export function parseCommissionRow(row) {
  return {
    orderId: row.order_id,
    status: row.status ?? "Pending",
    dueDate: row.due_date ?? null,
    paidDate: row.paid_date ?? null,
    amountManual: Boolean(row.amount_manual),
    amountOverride:
      row.amount_override === null || row.amount_override === undefined
        ? null
        : Number(row.amount_override),
    notes: row.notes ?? "",
  }
}

export function parseTaskRow(row) {
  return {
    id: row.id,
    title: row.title ?? "",
    description: row.description ?? "",
    type: row.type ?? "Other",
    priority: row.priority ?? "Medium",
    status: row.status ?? "Open",
    dueDate: row.due_date ?? "",
    dueTime: row.due_time ?? "",
    accountId: row.account_id ?? "",
    contactId: row.contact_id ?? "",
    brandId: row.brand_id ?? "",
    orderId: row.order_id ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    completedAt: row.completed_at ?? null,
  }
}

export function parseActivityEventRow(row) {
  return {
    id: row.id,
    type: row.event_type ?? "unknown",
    label: row.label ?? "",
    detail: row.detail ?? "",
    timestamp: row.occurred_at,
    link: row.link_path ?? "",
    accountId: row.account_id ?? undefined,
    contactId: row.contact_id ?? undefined,
    brandId: row.brand_id ?? undefined,
    orderId: row.order_id ?? undefined,
    taskId: row.task_id ?? undefined,
  }
}

export function parseDealRow(row) {
  return {
    id: row.id,
    title: row.title ?? "",
    accountId: row.account_id ?? "",
    brandId: row.brand_id ?? "",
    stage: row.stage ?? "Prospect",
    value: Number(row.value) || 0,
    notes: row.notes ?? "",
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

export function parseCalendarEventRow(row) {
  return {
    id: row.id,
    title: row.title ?? "",
    eventDate: row.event_date ?? null,
    eventTime: row.event_time ?? "",
    eventType: row.event_type ?? "Meeting",
    accountId: row.account_id ?? "",
    contactId: row.contact_id ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

export function transformContact(contact, userId) {
  return {
    id: contact.id,
    ...(userId ? { user_id: userId } : {}),
    name: resolveContactNameForSupabase(contact),
    first_name: contact.firstName ?? "",
    last_name: contact.lastName ?? "",
    account_id: toNullable(contact.accountId),
    brand_id: toNullable(contact.brandId),
    company: contact.company ?? "",
    role: contact.role ?? "",
    type: contact.type ?? "Buyer",
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    preferred_contact_method: contact.preferredContactMethod ?? "Call",
    city: contact.city ?? "",
    state: contact.state ?? "",
    notes: contact.notes ?? "",
    last_contact_date: toDate(contact.lastContactDate),
    next_follow_up_date: toDate(contact.nextFollowUpDate),
    import_batch_id: toNullable(contact.importBatchId),
    created_at: toTimestamp(contact.createdAt),
    updated_at: toTimestamp(contact.updatedAt),
  }
}

export function transformOrder(order, userId) {
  return {
    id: order.id,
    ...(userId ? { user_id: userId } : {}),
    order_number: String(order.orderNumber ?? ""),
    account_id: order.accountId,
    brand_id: order.brandId,
    order_date: toDate(order.orderDate),
    products_notes: order.productsNotes ?? "",
    order_amount: Number(order.orderAmount) || 0,
    commission_percent: Number(order.commissionPercent) || 0,
    commission_amount: Number(order.commissionAmount) || 0,
    order_status: order.orderStatus ?? "Draft",
    payment_status: order.paymentStatus ?? "Unpaid",
    payment_due_date: toDate(order.paymentDueDate),
    notes: order.notes ?? "",
    created_at: toTimestamp(order.createdAt),
    updated_at: toTimestamp(order.updatedAt),
  }
}

export function transformCommission(meta, userId) {
  return {
    order_id: meta.orderId,
    ...(userId ? { user_id: userId } : {}),
    status: meta.status ?? "Pending",
    due_date: toDate(meta.dueDate),
    paid_date: toDate(meta.paidDate),
    amount_manual: Boolean(meta.amountManual),
    amount_override:
      meta.amountOverride === null || meta.amountOverride === undefined
        ? null
        : Number(meta.amountOverride),
    notes: meta.notes ?? "",
  }
}

export function transformTask(task, userId) {
  return {
    id: task.id,
    ...(userId ? { user_id: userId } : {}),
    title: task.title ?? "",
    description: task.description ?? "",
    type: task.type ?? "Other",
    priority: task.priority ?? "Medium",
    status: task.status ?? "Open",
    due_date: toDate(task.dueDate),
    due_time: task.dueTime ?? "",
    account_id: toNullable(task.accountId),
    contact_id: toNullable(task.contactId),
    brand_id: toNullable(task.brandId),
    order_id: toNullable(task.orderId),
    notes: task.notes ?? "",
    created_at: toTimestamp(task.createdAt),
    updated_at: toTimestamp(task.updatedAt),
    completed_at: toTimestamp(task.completedAt),
  }
}

export function transformActivityEvent(event, userId) {
  return {
    id: event.id,
    ...(userId ? { user_id: userId } : {}),
    event_type: event.type ?? "unknown",
    label: event.label ?? "",
    detail: event.detail ?? "",
    occurred_at: toTimestamp(event.timestamp),
    link_path: event.link ?? "",
    account_id: toNullable(event.accountId),
    contact_id: toNullable(event.contactId),
    brand_id: toNullable(event.brandId),
    order_id: toNullable(event.orderId),
    task_id: toNullable(event.taskId),
    metadata: {},
  }
}

export function buildActivityEventsFromLocalData(data, userId) {
  const accounts = data.accounts ?? []
  const brands = data.brands ?? []
  const contacts = data.contacts ?? []
  const orders = data.orders ?? []
  const tasks = data.tasks ?? []
  const storedMeta = data.commissions ?? []
  const commissions = buildCommissionRecords(orders, brands, accounts, storedMeta)

  const ctx = buildRelationshipContext({
    accounts,
    contacts,
    orders,
    commissions,
    tasks,
    brands,
  })
  const events = buildActivityTimeline(ctx)
  return events.map((event) => transformActivityEvent(event, userId))
}

export function transformLocalDataForSupabase(data, { userId }) {
  if (!userId) {
    throw new Error("userId is required to transform local data for Supabase")
  }

  const accounts = data.accounts ?? []
  const brands = data.brands ?? []
  const contacts = data.contacts ?? []
  const orders = data.orders ?? []
  const commissions = data.commissions ?? []
  const tasks = data.tasks ?? []
  const deals = data.deals ?? []
  const calendarEvents = data.calendarEvents ?? []

  return {
    accounts: accounts.map((row) => transformAccount(row, userId)),
    brands: brands.map((row) => transformBrand(row, userId)),
    brand_products: transformBrandProducts(brands, userId),
    contacts: contacts.map((row) => transformContact(row, userId)),
    orders: orders.map((row) => transformOrder(row, userId)),
    commissions: commissions.map((row) => transformCommission(row, userId)),
    tasks: tasks.map((row) => transformTask(row, userId)),
    activity_events: buildActivityEventsFromLocalData(data, userId),
    deals: deals.map((row) => transformDeal(row, userId)),
    calendar_events: calendarEvents.map((row) => transformCalendarEvent(row, userId)),
  }
}
