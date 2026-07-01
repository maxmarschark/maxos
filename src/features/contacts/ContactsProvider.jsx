import { useCallback, useEffect, useMemo, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import { useAccounts } from "../accounts/useAccounts"
import { useBrands } from "../brands/useBrands"
import {
  CONTACTS_STORAGE_KEY,
  IMPORT_BATCHES_STORAGE_KEY,
  EMPTY_CONTACT,
} from "./constants"
import { buildSeedContacts } from "./seed"
import { ContactsContext } from "./contacts-context"
import { mergeContactData } from "./duplicates"
import { enrichContacts } from "./utils"

function loadLocalContacts() {
  return loadFromStorage(CONTACTS_STORAGE_KEY, buildSeedContacts())
}

function loadImportBatches() {
  return loadFromStorage(IMPORT_BATCHES_STORAGE_KEY, [])
}

function loadCloudApi() {
  return import("./contactsSupabase")
}

export function ContactsProvider({ children }) {
  const { accounts } = useAccounts()
  const { brands } = useBrands()

  const [contacts, setContacts] = useState(loadLocalContacts)
  const [importBatches, setImportBatches] = useState(loadImportBatches)

  const initCloud = useCallback(
    () => loadCloudApi().then(({ initCloudContacts }) => initCloudContacts()),
    []
  )
  const onCloudLoaded = useCallback((result) => {
    setContacts(result.contacts)
  }, [])

  const { storageMode, storageModeRef, fallBackToLocal } = useCloudBootstrap({
    moduleName: "Contacts",
    initCloud,
    onCloudLoaded,
  })

  useEffect(() => {
    saveToStorage(CONTACTS_STORAGE_KEY, contacts)
  }, [contacts])

  useEffect(() => {
    saveToStorage(IMPORT_BATCHES_STORAGE_KEY, importBatches)
  }, [importBatches])

  const syncContactToCloud = useCallback(
    async (contact) => {
      if (storageModeRef.current !== "cloud") return true
      const { updateCloudContact } = await loadCloudApi()
      const result = await updateCloudContact(contact)
      if (!result.ok) {
        console.error("[Max OS Contacts] Cloud update failed:", result.error)
        fallBackToLocal()
        return false
      }
      return true
    },
    [fallBackToLocal]
  )

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

  const addContact = useCallback(
    async (data) => {
      const now = new Date().toISOString()
      const contact = {
        ...EMPTY_CONTACT,
        ...data,
        importBatchId: data.importBatchId ?? null,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }

      if (storageModeRef.current === "cloud") {
        const { insertCloudContact } = await loadCloudApi()
        const result = await insertCloudContact(contact)
        if (result.ok) {
          setContacts((prev) => [result.contact, ...prev])
          return result.contact
        }
        console.error("[Max OS Contacts] Cloud insert failed:", result.error)
        fallBackToLocal()
      }

      setContacts((prev) => [contact, ...prev])
      return contact
    },
    [fallBackToLocal]
  )

  const updateContact = useCallback(
    (id, data) => {
      const now = new Date().toISOString()
      let updatedContact = null

      setContacts((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          updatedContact = { ...c, ...data, updatedAt: now }
          return updatedContact
        })
      )

      if (updatedContact) {
        void syncContactToCloud(updatedContact)
      }
    },
    [syncContactToCloud]
  )

  const deleteContact = useCallback(
    async (id) => {
      if (storageModeRef.current === "cloud") {
        const { deleteCloudContact } = await loadCloudApi()
        const result = await deleteCloudContact(id)
        if (!result.ok) {
          console.error("[Max OS Contacts] Cloud delete failed:", result.error)
          fallBackToLocal()
        }
      }
      setContacts((prev) => prev.filter((c) => c.id !== id))
      setImportBatches((prev) =>
        prev.map((batch) => ({
          ...batch,
          contactIds: batch.contactIds.filter((cid) => cid !== id),
          contactCount: batch.contactIds.filter((cid) => cid !== id).length,
        }))
      )
    },
    [fallBackToLocal]
  )

  const deleteContacts = useCallback(
    async (ids) => {
      const idSet = new Set(ids)
      if (storageModeRef.current === "cloud") {
        const { deleteCloudContact } = await loadCloudApi()
        for (const id of ids) {
          const result = await deleteCloudContact(id)
          if (!result.ok) {
            console.error("[Max OS Contacts] Cloud delete failed:", result.error)
            fallBackToLocal()
            break
          }
        }
      }
      setContacts((prev) => prev.filter((c) => !idSet.has(c.id)))
      setImportBatches((prev) =>
        prev.map((batch) => {
          const contactIds = batch.contactIds.filter((cid) => !idSet.has(cid))
          return { ...batch, contactIds, contactCount: contactIds.length }
        })
      )
    },
    [fallBackToLocal]
  )

  const clearAllContacts = useCallback(async () => {
    if (storageModeRef.current === "cloud") {
      const { deleteCloudContact } = await loadCloudApi()
      for (const contact of contacts) {
        const result = await deleteCloudContact(contact.id)
        if (!result.ok) {
          console.error("[Max OS Contacts] Cloud delete failed:", result.error)
          fallBackToLocal()
          break
        }
      }
    }
    setContacts([])
    setImportBatches([])
  }, [contacts, fallBackToLocal])

  const importContactsBatch = useCallback(
    ({ fileName, items, duplicateActions = {} }) => {
      const now = new Date().toISOString()
      const batchId = generateId()
      const createdIds = []
      const toSync = []

      setContacts((prev) => {
        let next = [...prev]

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
              return updated
            })
            if (!createdIds.includes(_duplicateTargetId)) {
              createdIds.push(_duplicateTargetId)
            }
            return
          }

          if (_duplicateTargetId && action === "merge") {
            next = next.map((c) => {
              if (c.id !== _duplicateTargetId) return c
              const merged = mergeContactData(c, contactData)
              const updated = { ...merged, importBatchId: c.importBatchId ?? batchId }
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

        return next
      })

      if (storageModeRef.current === "cloud") {
        void (async () => {
          const { insertCloudContact, updateCloudContact } = await loadCloudApi()
          for (const { contact, isUpdate } of toSync) {
            const result = isUpdate
              ? await updateCloudContact(contact)
              : await insertCloudContact(contact)
            if (!result.ok) {
              console.error("[Max OS Contacts] Cloud import sync failed:", result.error)
              fallBackToLocal()
              return
            }
          }
        })()
      }

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
    [fallBackToLocal]
  )

  const deleteImportBatch = useCallback(
    async (batchId) => {
      const batchContacts = contacts.filter((c) => c.importBatchId === batchId)
      if (storageModeRef.current === "cloud") {
        const { deleteCloudContact } = await loadCloudApi()
        for (const contact of batchContacts) {
          const result = await deleteCloudContact(contact.id)
          if (!result.ok) {
            console.error("[Max OS Contacts] Cloud delete failed:", result.error)
            fallBackToLocal()
            break
          }
        }
      }
      setContacts((prev) => prev.filter((c) => c.importBatchId !== batchId))
      setImportBatches((prev) => prev.filter((b) => b.id !== batchId))
    },
    [contacts, fallBackToLocal]
  )

  const value = {
    contacts: enrichedContacts,
    rawContacts: contacts,
    importBatches,
    accounts,
    brands,
    storageMode,
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
  }

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>
}
