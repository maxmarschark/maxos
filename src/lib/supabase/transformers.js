import { buildCommissionRecords } from "../../features/commissions/utils"
import { buildActivityTimeline, buildRelationshipContext } from "../relationships"

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
    user_id: userId,
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
      rows.push({
        id: product.id,
        brand_id: brand.id,
        user_id: userId,
        product_name: product.productName ?? "",
        sku: product.sku ?? "",
        category: product.category ?? "",
        distributor_price: Number(product.distributorPrice) || 0,
        wholesale_price: Number(product.wholesalePrice) || 0,
        msrp: Number(product.msrp) || 0,
        commission_override:
          product.commissionOverride === null || product.commissionOverride === undefined
            ? null
            : Number(product.commissionOverride),
        notes: product.notes ?? "",
        created_at: toTimestamp(brand.createdAt),
        updated_at: toTimestamp(brand.updatedAt),
      })
    }
  }
  return rows
}

export function transformContact(contact, userId) {
  return {
    id: contact.id,
    user_id: userId,
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
    user_id: userId,
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
    user_id: userId,
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
    user_id: userId,
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
    user_id: userId,
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

  return {
    accounts: accounts.map((row) => transformAccount(row, userId)),
    brands: brands.map((row) => transformBrand(row, userId)),
    brand_products: transformBrandProducts(brands, userId),
    contacts: contacts.map((row) => transformContact(row, userId)),
    orders: orders.map((row) => transformOrder(row, userId)),
    commissions: commissions.map((row) => transformCommission(row, userId)),
    tasks: tasks.map((row) => transformTask(row, userId)),
    activity_events: buildActivityEventsFromLocalData(data, userId),
  }
}
