import { useCallback, useEffect, useMemo, useState } from "react"
import { generateId } from "../../lib/id"
import { loadFromStorage, saveToStorage } from "../../lib/storage"
import { useCloudBootstrap } from "../../lib/supabase/useCloudBootstrap"
import { isSupabaseConfigured } from "../../lib/supabase/env"
import {
  persistCloudBatch,
  persistCloudDelete,
  persistCloudInsert,
  persistCloudUpdate,
} from "../../lib/supabase/cloudPersist"
import { useAuthReady } from "../auth/useAuthReady"
import { useAccounts } from "../accounts/useAccounts"
import { useBrands } from "../brands/useBrands"
import {
  CONTACTS_STORAGE_KEY,
  IMPORT_BATCHES_STORAGE_KEY,
  EMPTY_CONTACT,
} from "./constants"
import { buildSeedContacts } from "./seed"
import { ContactsContext } from "./contacts-context"
import { buildContactImportPlan } from "./importBatch"
import { sanitizeContactImportBatch } from "./cloudContactSanitize"
import { enrichContacts } from "./utils"
import {
  logContactsImportPlan,
  logCloudAttemptingBatchInsert,
  logCloudRemainingInCloudMode,
} from "../../lib/debug/csvImportDiagnostics"

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
  const authReady = useAuthReady()
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

  const { storageMode, storageModeRef } = useCloudBootstrap({
    moduleName: "Contacts",
    initCloud,
    onCloudLoaded,
    authReady,
  })

  useEffect(() => {
    saveToStorage(CONTACTS_STORAGE_KEY, contacts)
  }, [contacts])

  useEffect(() => {
    saveToStorage(IMPORT_BATCHES_STORAGE_KEY, importBatches)
  }, [importBatches])

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

      const { insertCloudContact } = await loadCloudApi()
      const persisted = await persistCloudInsert({
        storageModeRef,
        insert: insertCloudContact,
        entity: contact,
        label: "Contacts",
      })

      if (!persisted.ok) return null
      setContacts((prev) => [persisted.entity, ...prev])
      return persisted.entity
    },
    []
  )

  const updateContact = useCallback(
    async (id, data) => {
      const existing = contacts.find((c) => c.id === id)
      if (!existing) return false

      const updatedContact = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      }

      const { updateCloudContact } = await loadCloudApi()
      const persisted = await persistCloudUpdate({
        storageModeRef,
        update: updateCloudContact,
        entity: updatedContact,
        label: "Contacts",
      })

      if (!persisted.ok) return false
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? persisted.entity : c))
      )
      return true
    },
    [contacts]
  )

  const deleteContact = useCallback(
    async (id) => {
      const { deleteCloudContact } = await loadCloudApi()
      const persisted = await persistCloudDelete({
        storageModeRef,
        remove: deleteCloudContact,
        id,
        label: "Contacts",
      })

      if (!persisted.ok) return false

      setContacts((prev) => prev.filter((c) => c.id !== id))
      setImportBatches((prev) =>
        prev.map((batch) => ({
          ...batch,
          contactIds: batch.contactIds.filter((cid) => cid !== id),
          contactCount: batch.contactIds.filter((cid) => cid !== id).length,
        }))
      )
      return true
    },
    []
  )

  const deleteContacts = useCallback(
    async (ids) => {
      const idSet = new Set(ids)
      const { deleteCloudContact } = await loadCloudApi()

      if (storageModeRef.current === "cloud") {
        for (const id of ids) {
          const persisted = await persistCloudDelete({
            storageModeRef,
            remove: deleteCloudContact,
            id,
            label: "Contacts",
          })
          if (!persisted.ok) return false
        }
      }

      setContacts((prev) => prev.filter((c) => !idSet.has(c.id)))
      setImportBatches((prev) =>
        prev.map((batch) => {
          const contactIds = batch.contactIds.filter((cid) => !idSet.has(cid))
          return { ...batch, contactIds, contactCount: contactIds.length }
        })
      )
      return true
    },
    []
  )

  const clearAllContacts = useCallback(async () => {
    if (storageModeRef.current === "cloud") {
      const { deleteCloudContact } = await loadCloudApi()
      for (const contact of contacts) {
        const persisted = await persistCloudDelete({
          storageModeRef,
          remove: deleteCloudContact,
          id: contact.id,
          label: "Contacts",
        })
        if (!persisted.ok) return false
      }
    }

    setContacts([])
    setImportBatches([])
    return true
  }, [contacts])

  const importContactsBatch = useCallback(
    async ({ fileName, items, duplicateActions = {} }) => {
      console.log("[Contacts] importContactsBatch() called", {
        fileName,
        itemCount: items.length,
        storageMode: storageModeRef.current,
      })

      const { nextContacts, toSync, batch } = buildContactImportPlan({
        items,
        duplicateActions,
        existingContacts: contacts,
        fileName,
      })

      logContactsImportPlan({
        toSyncCount: toSync.length,
        batchId: batch.id,
        storageMode: storageModeRef.current,
      })

      if (toSync.length === 0) {
        throw new Error("No contacts selected for import.")
      }

      const inCloudMode = storageModeRef.current === "cloud"

      if (isSupabaseConfigured() && !inCloudMode) {
        throw new Error(
          "Contacts cloud sync is not ready. Wait for the CLOUD badge or sign in again before importing."
        )
      }

      if (inCloudMode) {
        const accountIds = new Set(accounts.map((a) => a.id))
        const brandIds = new Set(brands.map((b) => b.id))
        const sanitizedSync = sanitizeContactImportBatch(toSync, { accountIds, brandIds })

        logCloudAttemptingBatchInsert({
          count: sanitizedSync.length,
          storageModeRef,
        })

        const batchResult = await persistCloudBatch({
          storageModeRef,
          label: "Contacts",
          runBatch: async () => {
            const { importCloudContactsBatch } = await loadCloudApi()
            return importCloudContactsBatch(sanitizedSync)
          },
        })

        logCloudRemainingInCloudMode({
          label: "Contacts",
          storageModeRef,
          context: "after persistCloudBatch",
        })

        if (!batchResult.ok) {
          logCloudRemainingInCloudMode({
            label: "Contacts",
            storageModeRef,
            context: "batch failed — before throw",
          })
          throw new Error(batchResult.error ?? "Cloud import failed")
        }

        const { initCloudContacts } = await loadCloudApi()
        const refreshed = await initCloudContacts()
        if (refreshed.ok) {
          setContacts(refreshed.contacts)
        } else {
          setContacts(nextContacts)
        }
      } else {
        setContacts(nextContacts)
      }

      logCloudRemainingInCloudMode({
        label: "Contacts",
        storageModeRef,
        context: "import complete — before import history update",
      })

      setImportBatches((prev) => [batch, ...prev])
      return batch
    },
    [contacts, accounts, brands]
  )

  const deleteImportBatch = useCallback(
    async (batchId) => {
      const batchContacts = contacts.filter((c) => c.importBatchId === batchId)

      if (storageModeRef.current === "cloud") {
        const { deleteCloudContact } = await loadCloudApi()
        for (const contact of batchContacts) {
          const persisted = await persistCloudDelete({
            storageModeRef,
            remove: deleteCloudContact,
            id: contact.id,
            label: "Contacts",
          })
          if (!persisted.ok) return false
        }
      }

      setContacts((prev) => prev.filter((c) => c.importBatchId !== batchId))
      setImportBatches((prev) => prev.filter((b) => b.id !== batchId))
      return true
    },
    [contacts]
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
