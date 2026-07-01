import { useCallback, useEffect, useMemo, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import {
  CONTACTS_STORAGE_KEY,
  IMPORT_BATCHES_STORAGE_KEY,
  EMPTY_CONTACT,
} from "./constants"
import { buildSeedContacts } from "./seed"
import { ContactsContext } from "./contacts-context"
import { mergeContactData } from "./duplicates"
import {
  enrichContacts,
  loadAccountsForContacts,
  loadBrandsForContacts,
} from "./utils"

function loadContacts() {
  return loadFromStorage(CONTACTS_STORAGE_KEY, buildSeedContacts())
}

function loadImportBatches() {
  return loadFromStorage(IMPORT_BATCHES_STORAGE_KEY, [])
}

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState(loadContacts)
  const [importBatches, setImportBatches] = useState(loadImportBatches)
  const [accounts, setAccounts] = useState(loadAccountsForContacts)
  const [brands, setBrands] = useState(loadBrandsForContacts)

  useEffect(() => {
    saveToStorage(CONTACTS_STORAGE_KEY, contacts)
  }, [contacts])

  useEffect(() => {
    saveToStorage(IMPORT_BATCHES_STORAGE_KEY, importBatches)
  }, [importBatches])

  useEffect(() => {
    function syncReferences() {
      setAccounts(loadAccountsForContacts())
      setBrands(loadBrandsForContacts())
    }

    window.addEventListener("storage", syncReferences)
    return () => window.removeEventListener("storage", syncReferences)
  }, [])

  const enrichedContacts = useMemo(
    () => enrichContacts(contacts, accounts, brands),
    [contacts, accounts, brands]
  )

  const getContact = useCallback(
    (id) => enrichedContacts.find((c) => c.id === id),
    [enrichedContacts]
  )

  const getContactsByAccount = useCallback(
    (accountId) => enrichedContacts.filter((c) => c.accountId === accountId),
    [enrichedContacts]
  )

  const getContactsByBrand = useCallback(
    (brandId) => enrichedContacts.filter((c) => c.brandId === brandId),
    [enrichedContacts]
  )

  const addContact = useCallback((data) => {
    const now = new Date().toISOString()
    const contact = {
      ...EMPTY_CONTACT,
      ...data,
      importBatchId: data.importBatchId ?? null,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    setContacts((prev) => [contact, ...prev])
    return contact
  }, [])

  const updateContact = useCallback((id, data) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      )
    )
  }, [])

  const deleteContact = useCallback((id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
    setImportBatches((prev) =>
      prev.map((batch) => ({
        ...batch,
        contactIds: batch.contactIds.filter((cid) => cid !== id),
        contactCount: batch.contactIds.filter((cid) => cid !== id).length,
      }))
    )
  }, [])

  const deleteContacts = useCallback((ids) => {
    const idSet = new Set(ids)
    setContacts((prev) => prev.filter((c) => !idSet.has(c.id)))
    setImportBatches((prev) =>
      prev.map((batch) => {
        const contactIds = batch.contactIds.filter((cid) => !idSet.has(cid))
        return { ...batch, contactIds, contactCount: contactIds.length }
      })
    )
  }, [])

  const clearAllContacts = useCallback(() => {
    setContacts([])
    setImportBatches([])
  }, [])

  const importContactsBatch = useCallback(
    ({ fileName, items, duplicateActions = {} }) => {
      const now = new Date().toISOString()
      const batchId = generateId()
      const createdIds = []

      setContacts((prev) => {
        let next = [...prev]

        items.forEach((item, index) => {
          const action = duplicateActions[index] ?? "skip"
          const { _duplicateTargetId, _isInFileDuplicate, ...contactData } = item

          if (action === "skip" && (_duplicateTargetId || _isInFileDuplicate)) return

          if (_duplicateTargetId && action === "replace") {
            next = next.map((c) =>
              c.id === _duplicateTargetId
                ? {
                    ...c,
                    ...contactData,
                    importBatchId: batchId,
                    updatedAt: now,
                  }
                : c
            )
            if (!createdIds.includes(_duplicateTargetId)) {
              createdIds.push(_duplicateTargetId)
            }
            return
          }

          if (_duplicateTargetId && action === "merge") {
            next = next.map((c) => {
              if (c.id !== _duplicateTargetId) return c
              const merged = mergeContactData(c, contactData)
              if (!createdIds.includes(c.id)) createdIds.push(c.id)
              return { ...merged, importBatchId: c.importBatchId ?? batchId }
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
          next.unshift(contact)
        })

        return next
      })

      const batch = {
        id: batchId,
        fileName: fileName || "import.csv",
        contactCount: createdIds.length,
        contactIds: createdIds,
        importedAt: now,
      }

      setImportBatches((prev) => [batch, ...prev])
      return batch
    },
    []
  )

  const deleteImportBatch = useCallback((batchId) => {
    setContacts((prev) => prev.filter((c) => c.importBatchId !== batchId))
    setImportBatches((prev) => prev.filter((b) => b.id !== batchId))
  }, [])

  const refreshReferences = useCallback(() => {
    setAccounts(loadAccountsForContacts())
    setBrands(loadBrandsForContacts())
  }, [])

  const value = {
    contacts: enrichedContacts,
    rawContacts: contacts,
    importBatches,
    accounts,
    brands,
    getContact,
    getContactsByAccount,
    getContactsByBrand,
    addContact,
    updateContact,
    deleteContact,
    deleteContacts,
    clearAllContacts,
    importContactsBatch,
    deleteImportBatch,
    refreshReferences,
  }

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>
}
