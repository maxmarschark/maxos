import { generateId } from "../../lib/id"
import { loadReferenceData } from "./utils"

export function buildSeedTasks() {
  const { accounts, contacts } = loadReferenceData()
  const account = accounts[0]
  const contact = contacts[0]
  const now = new Date().toISOString()
  const today = now.slice(0, 10)

  const tasks = []

  if (account) {
    tasks.push({
      id: generateId(),
      title: "Collect overdue payment",
      description: "Payment is past due — coordinate with owner.",
      type: "Collection",
      priority: "Urgent",
      status: "Open",
      dueDate: today,
      dueTime: "10:00",
      accountId: account.id,
      contactId: "",
      brandId: "",
      orderId: "",
      notes: "",
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    })
  }

  if (contact) {
    tasks.push({
      id: generateId(),
      title: `Follow up with ${contact.firstName} ${contact.lastName}`.trim(),
      description: "Scheduled follow-up from CRM.",
      type: "Call",
      priority: "High",
      status: "Open",
      dueDate: today,
      dueTime: "",
      accountId: contact.accountId ?? "",
      contactId: contact.id,
      brandId: contact.brandId ?? "",
      orderId: "",
      notes: "",
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    })
  }

  tasks.push({
    id: generateId(),
    title: "Update weekly pipeline notes",
    description: "Log activity from the week in CRM.",
    type: "Admin",
    priority: "Medium",
    status: "Open",
    dueDate: today,
    dueTime: "",
    accountId: "",
    contactId: "",
    brandId: "",
    orderId: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  })

  return tasks
}
