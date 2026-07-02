import { generateId } from "../../lib/id"
import { EMPTY_CONTACT } from "./constants"
import { mergeContactData } from "./duplicates"

/**
 * Pure import planner — computes next contacts list and cloud sync ops.
 */
export function buildContactImportPlan({ items, duplicateActions = {}, existingContacts, fileName }) {
  const now = new Date().toISOString()
  const batchId = generateId()
  const createdIds = []
  const toSync = []
  let next = [...existingContacts]

  items.forEach((item, index) => {
    const action = duplicateActions[index] ?? "skip"
    const { _duplicateTargetId, _isInFileDuplicate, ...contactData } = item

    if (action === "skip" && (_duplicateTargetId || _isInFileDuplicate)) return

    if (_duplicateTargetId && action === "replace") {
      next = next.map((c) => {
        if (c.id !== _duplicateTargetId) return c
        const updated = {
          ...c,
          ...contactData,
          importBatchId: batchId,
          updatedAt: now,
        }
        toSync.push({ contact: updated, isUpdate: true })
        if (!createdIds.includes(_duplicateTargetId)) {
          createdIds.push(_duplicateTargetId)
        }
        return updated
      })
      return
    }

    if (_duplicateTargetId && action === "merge") {
      next = next.map((c) => {
        if (c.id !== _duplicateTargetId) return c
        const merged = mergeContactData(c, contactData)
        const updated = { ...merged, importBatchId: c.importBatchId ?? batchId, updatedAt: now }
        toSync.push({ contact: updated, isUpdate: true })
        if (!createdIds.includes(c.id)) createdIds.push(c.id)
        return updated
      })
      return
    }

    const contact = {
      ...EMPTY_CONTACT,
      ...contactData,
      importBatchId: batchId,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    createdIds.push(contact.id)
    toSync.push({ contact, isUpdate: false })
    next.unshift(contact)
  })

  const batch = {
    id: batchId,
    fileName: fileName || "import.csv",
    contactCount: createdIds.length,
    contactIds: createdIds,
    importedAt: now,
  }

  return { nextContacts: next, toSync, batch }
}
