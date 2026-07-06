import { formatCurrency, formatDate } from "../../lib/format"
import { normalizeAssetType } from "../brand-files/utils"
import { STARTER_PROMPTS } from "./constants"

function bullet(lines) {
  return lines.filter(Boolean).map((line) => `• ${line}`).join("\n")
}

function section(title, body) {
  if (!body?.trim()) return ""
  return `${title}\n${body}`
}

export function generateNextSteps(ctx) {
  const lines = []
  const { brand } = ctx

  if (ctx.overdueTasks.length > 0) {
    const names = ctx.overdueTasks
      .slice(0, 3)
      .map((t) => `${t.title}${t.dueDate ? ` (due ${formatDate(t.dueDate)})` : ""}`)
    lines.push(`Complete ${ctx.overdueTasks.length} overdue task${ctx.overdueTasks.length !== 1 ? "s" : ""}: ${names.join("; ")}.`)
  }

  if (ctx.tasksDueToday.length > 0) {
    lines.push(
      `You have ${ctx.tasksDueToday.length} task${ctx.tasksDueToday.length !== 1 ? "s" : ""} due today — start with "${ctx.tasksDueToday[0].title}".`
    )
  }

  if (ctx.overdueFollowUpContacts.length > 0) {
    const names = ctx.overdueFollowUpContacts
      .slice(0, 3)
      .map((c) => c.fullName ?? c.name)
    lines.push(
      `Follow up with overdue contacts: ${names.join(", ")}.`
    )
  }

  if (ctx.accountsNeedingFollowUp.length > 0) {
    const names = ctx.accountsNeedingFollowUp
      .slice(0, 3)
      .map((a) => a.businessName)
    lines.push(`Visit or call accounts due for follow-up: ${names.join(", ")}.`)
  }

  if (ctx.staleOpenDeals.length > 0) {
    const names = ctx.staleOpenDeals.slice(0, 3).map((d) => d.title)
    lines.push(
      `${ctx.staleOpenDeals.length} open deal${ctx.staleOpenDeals.length !== 1 ? "s" : ""} haven't moved in 14+ days — check in on: ${names.join(", ")}.`
    )
  }

  if (!ctx.hasSalesSheet || !ctx.hasCatalog) {
    const missing = []
    if (!ctx.hasSalesSheet) missing.push("Sales Sheet")
    if (!ctx.hasCatalog) missing.push("Catalog")
    if (!ctx.hasPriceList) missing.push("Price List")
    lines.push(`Upload missing assets: ${missing.join(", ")}.`)
  }

  if (ctx.brandContacts.length === 0) {
    lines.push("Add contacts for this brand so you can track buyers and follow-ups.")
  }

  if (ctx.openDeals.length === 0) {
    lines.push("Create an open deal to track pipeline opportunities for this brand.")
  }

  if (ctx.unpaidOrders.length > 0) {
    lines.push(
      `Collect payment on ${ctx.unpaidOrders.length} unpaid order${ctx.unpaidOrders.length !== 1 ? "s" : ""} (${formatCurrency(ctx.unpaidOrders.reduce((s, o) => s + (Number(o.orderAmount) || 0), 0))} total).`
    )
  }

  if (ctx.featuredAsset) {
    lines.push(
      `Send buyers the featured asset: "${ctx.featuredAsset.fileName}" (${normalizeAssetType(ctx.featuredAsset.category)}).`
    )
  }

  if (lines.length === 0) {
    return `**${brand.brandName} looks healthy.**\n\nNo urgent overdue tasks, follow-ups, or stale deals. Consider reviewing recent orders and adding a note after your next buyer conversation.`
  }

  return section(`**Recommended next steps for ${brand.brandName}**`, bullet(lines))
}

export function generateSummary(ctx) {
  const { brand, metrics } = ctx
  const lines = [
    `Status: ${brand.status} · Default commission: ${brand.commissionDefault ?? 0}%`,
    `${ctx.products.length} product${ctx.products.length !== 1 ? "s" : ""} in catalog`,
    `${ctx.brandAccounts.length} account${ctx.brandAccounts.length !== 1 ? "s" : ""} carrying this brand`,
    `${ctx.brandContacts.length} linked contact${ctx.brandContacts.length !== 1 ? "s" : ""}`,
    `${ctx.openDeals.length} open deal${ctx.openDeals.length !== 1 ? "s" : ""} · ${ctx.brandDeals.filter((d) => d.stage === "Won").length} won`,
    `${metrics.orderCount} orders · ${formatCurrency(metrics.totalSales)} revenue`,
    `${formatCurrency(metrics.pendingCommission)} pending commission`,
    `${ctx.assets.length} uploaded asset${ctx.assets.length !== 1 ? "s" : ""}`,
  ]

  if (brand.mainContact) {
    lines.unshift(`Main contact: ${brand.mainContact}`)
  }

  let body = bullet(lines)

  if (ctx.recentActivity.length > 0) {
    const activityLines = ctx.recentActivity.slice(0, 4).map((e) => {
      const when = e.timestamp ? formatDate(e.timestamp) : ""
      return `${e.label}${when ? ` (${when})` : ""}`
    })
    body += `\n\n**Recent activity**\n${bullet(activityLines)}`
  }

  return section(`**${brand.brandName} — summary**`, body)
}

export function generateAccountsFollowUp(ctx) {
  const { brand } = ctx
  const overdueAccounts = ctx.brandAccounts.filter(
    (a) => a.nextFollowUp && isOverdueAccount(a.nextFollowUp, ctx.todayISO)
  )
  const dueTodayAccounts = ctx.brandAccounts.filter(
    (a) => a.nextFollowUp && a.nextFollowUp.slice(0, 10) === ctx.todayISO
  )

  if (overdueAccounts.length === 0 && dueTodayAccounts.length === 0 && ctx.overdueFollowUpContacts.length === 0) {
    return `**No accounts or contacts need immediate follow-up** for ${brand.brandName}.\n\nSet next follow-up dates on accounts and contacts to get reminders here.`
  }

  const lines = []

  if (overdueAccounts.length > 0) {
    lines.push(
      ...overdueAccounts.map(
        (a) =>
          `${a.businessName} — follow-up overdue (was ${formatDate(a.nextFollowUp)})`
      )
    )
  }

  if (dueTodayAccounts.length > 0) {
    lines.push(
      ...dueTodayAccounts.map(
        (a) => `${a.businessName} — follow-up due today`
      )
    )
  }

  if (ctx.overdueFollowUpContacts.length > 0) {
    lines.push(
      ...ctx.overdueFollowUpContacts.map(
        (c) =>
          `Contact: ${c.fullName ?? c.name} at ${c.companyDisplay || "—"} — overdue (${formatDate(c.nextFollowUpDate)})`
      )
    )
  }

  return section(`**Accounts & contacts needing follow-up**`, bullet(lines))
}

function isOverdueAccount(dateStr, todayISO) {
  return dateStr?.slice(0, 10) < todayISO
}

export function generateOpenDeals(ctx) {
  const { brand, openDeals } = ctx

  if (openDeals.length === 0) {
    return `**No open deals** are tied to ${brand.brandName}.\n\nCreate a deal from the Deals page and link it to this brand to track pipeline value.`
  }

  const lines = openDeals.map((deal) => {
    const value = formatCurrency(Number(deal.value) || 0)
    const updated = deal.updatedAt ? formatDate(deal.updatedAt) : "—"
    const stale = ctx.staleOpenDeals.some((d) => d.id === deal.id) ? " · stale 14d+" : ""
    return `${deal.title} — ${deal.stage} · ${value} · updated ${updated}${stale}`
  })

  const total = openDeals.reduce((s, d) => s + (Number(d.value) || 0), 0)
  const header = `${openDeals.length} open deal${openDeals.length !== 1 ? "s" : ""} · ${formatCurrency(total)} pipeline value`

  return `${section(`**Open deals for ${brand.brandName}**`, header)}\n\n${bullet(lines)}`
}

export function generateAssetsForBuyer(ctx) {
  const { brand, assets, featuredAsset } = ctx

  if (assets.length === 0) {
    return `**No assets uploaded** for ${brand.brandName}.\n\nUpload a Sales Sheet and Catalog in the Assets tab before your next buyer meeting.`
  }

  const lines = []

  if (featuredAsset) {
    lines.push(
      `★ Featured: "${featuredAsset.fileName}" (${normalizeAssetType(featuredAsset.category)}) — send this first`
    )
  }

  const priorityTypes = ["Sales Sheet", "Catalog", "Price List", "Marketing", "COA / Lab Results"]
  for (const type of priorityTypes) {
    const matches = assets.filter((a) => normalizeAssetType(a.category) === type)
    if (matches.length > 0) {
      const names = matches.slice(0, 2).map((a) => a.fileName).join(", ")
      lines.push(`${type}: ${names}${matches.length > 2 ? ` (+${matches.length - 2} more)` : ""}`)
    }
  }

  const covered = new Set(priorityTypes)
  const other = assets.filter((a) => !covered.has(normalizeAssetType(a.category)))
  if (other.length > 0) {
    lines.push(
      `Other: ${other.slice(0, 3).map((a) => a.fileName).join(", ")}${other.length > 3 ? ` (+${other.length - 3} more)` : ""}`
    )
  }

  if (!ctx.hasSalesSheet) {
    lines.push("⚠ Sales Sheet is missing — upload one before sending materials.")
  }
  if (!ctx.hasCatalog) {
    lines.push("⚠ Catalog is missing — buyers often ask for a full product list.")
  }

  return section(`**Assets to send a buyer for ${brand.brandName}**`, bullet(lines))
}

export function generateMissingProfile(ctx) {
  const { brand } = ctx
  const gaps = []

  if (!brand.description?.trim()) gaps.push("Brand description")
  if (!brand.website?.trim()) gaps.push("Website")
  if (!brand.mainContact?.trim()) gaps.push("Main contact name")
  if (!brand.contactEmail?.trim()) gaps.push("Contact email")
  if (!brand.contactPhone?.trim()) gaps.push("Contact phone")
  if (ctx.products.length === 0) gaps.push("Products in catalog")
  if (ctx.brandContacts.length === 0) gaps.push("Linked contacts")
  if (ctx.brandAccounts.length === 0) gaps.push("Accounts carrying this brand")
  if (!ctx.hasSalesSheet) gaps.push("Sales Sheet asset")
  if (!ctx.hasCatalog) gaps.push("Catalog asset")
  if (!ctx.hasPriceList) gaps.push("Price List asset")
  if (ctx.openDeals.length === 0) gaps.push("Open pipeline deals")
  if (ctx.noteEntries.length === 0 && !ctx.internalNotes?.trim()) gaps.push("Notes or partnership history")

  if (gaps.length === 0) {
    return `**${brand.brandName} profile looks complete.**\n\nCore details, products, contacts, accounts, assets, and deals are in place. Keep notes and assets up to date after each buyer touchpoint.`
  }

  return section(`**Missing or incomplete for ${brand.brandName}**`, bullet(gaps))
}

export function generateGeneralResponse(ctx, question) {
  const q = question.toLowerCase()

  if (q.includes("task")) {
    if (ctx.brandTasks.length === 0) {
      return `No tasks are linked to ${ctx.brand.brandName}. Create tasks from the Tasks page and link them to this brand, an account, or a contact.`
    }
    const lines = ctx.brandTasks.slice(0, 6).map(
      (t) => `${t.title} — ${t.status}${t.dueDate ? ` · due ${formatDate(t.dueDate)}` : ""}`
    )
    return section(`**Tasks for ${ctx.brand.brandName}**`, bullet(lines))
  }

  if (q.includes("order") || q.includes("revenue") || q.includes("sales")) {
    if (ctx.brandOrders.length === 0) {
      return `No orders recorded for ${ctx.brand.brandName} yet.`
    }
    const lines = ctx.brandOrders.slice(0, 5).map(
      (o) => `#${o.orderNumber} — ${o.accountName} · ${formatCurrency(o.orderAmount)} · ${o.orderStatus}`
    )
    return `${section(`**Orders for ${ctx.brand.brandName}**`, `${ctx.brandOrders.length} orders · ${formatCurrency(ctx.metrics.totalSales)} total`)}\n\n${bullet(lines)}`
  }

  if (q.includes("contact")) {
    if (ctx.brandContacts.length === 0) {
      return `No contacts linked to ${ctx.brand.brandName}. Add buyers and managers in the Contacts tab.`
    }
    const lines = ctx.brandContacts.slice(0, 6).map(
      (c) => `${c.fullName ?? c.name} — ${c.companyDisplay || "—"} · ${c.type}`
    )
    return section(`**Contacts for ${ctx.brand.brandName}**`, bullet(lines))
  }

  if (q.includes("product")) {
    if (ctx.products.length === 0) {
      return `No products in the ${ctx.brand.brandName} catalog. Add products in the Products tab.`
    }
    const lines = ctx.products.slice(0, 6).map((p) => p.productName)
    return section(`**Products for ${ctx.brand.brandName}**`, bullet(lines))
  }

  return `${generateNextSteps(ctx)}\n\n_Tip: Try a starter prompt, or ask about tasks, orders, contacts, or products for this brand._`
}

const PROMPT_HANDLERS = {
  "next-steps": generateNextSteps,
  summarize: generateSummary,
  "accounts-follow-up": generateAccountsFollowUp,
  "open-deals": generateOpenDeals,
  "assets-buyer": generateAssetsForBuyer,
  "missing-profile": generateMissingProfile,
}

export function answerBrandQuestion(question, ctx, promptId = null) {
  if (promptId && PROMPT_HANDLERS[promptId]) {
    return PROMPT_HANDLERS[promptId](ctx)
  }

  const q = question.toLowerCase().trim()

  for (const prompt of STARTER_PROMPTS) {
    if (q === prompt.label.toLowerCase()) {
      return PROMPT_HANDLERS[prompt.id](ctx)
    }
  }

  if (q.includes("next") || q.includes("should i do") || q.includes("priority")) {
    return generateNextSteps(ctx)
  }
  if (q.includes("summar")) {
    return generateSummary(ctx)
  }
  if (q.includes("follow-up") || q.includes("follow up") || q.includes("account")) {
    return generateAccountsFollowUp(ctx)
  }
  if (q.includes("open deal") || q.includes("pipeline") || q.includes("deal")) {
    return generateOpenDeals(ctx)
  }
  if (q.includes("asset") || q.includes("send") || q.includes("buyer") || q.includes("sheet") || q.includes("catalog")) {
    return generateAssetsForBuyer(ctx)
  }
  if (q.includes("missing") || q.includes("incomplete") || q.includes("gap")) {
    return generateMissingProfile(ctx)
  }

  return generateGeneralResponse(ctx, question)
}

export function formatAssistantMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^• /gm, "• ")
    .replace(/_([^_]+)_/g, "$1")
}
