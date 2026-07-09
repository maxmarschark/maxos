import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Download, Trash2, Upload, UserPlus, Users } from "lucide-react"
import { useContacts } from "../features/contacts/useContacts"
import { ContactsTable } from "../features/contacts/components/ContactsTable"
import { ContactFormModal } from "../features/contacts/components/ContactFormModal"
import { DeleteContactModal } from "../features/contacts/components/DeleteContactModal"
import { BulkDeleteModal } from "../features/contacts/components/BulkDeleteModal"
import { ClearAllContactsModal } from "../features/contacts/components/ClearAllContactsModal"
import { CsvImportModal } from "../features/contacts/components/CsvImportModal"
import { ImportHistoryPanel } from "../features/contacts/components/ImportHistoryPanel"
import { Button } from "../components/ui/Button"
import { SearchInput } from "../components/ui/SearchInput"
import { Select } from "../components/ui/Select"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { StorageModeBadge } from "../components/ui/StorageModeBadge"
import { Pagination } from "../components/ui/Pagination"
import { useToast } from "../components/ui/useToast"
import { usePagination } from "../hooks/usePagination"
import { useTableSort } from "../hooks/useTableSort"
import { sortRowsByField } from "../lib/tableSort"
import { CONTACT_TYPES } from "../features/contacts/constants"
import { handleCloudSave } from "../lib/handleCloudSave"
import { findDuplicateContactForAccount } from "../features/contacts/contactAccountPrefill"

function filterContacts(contacts, { search, typeFilter }) {
  let result = [...contacts]

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.companyDisplay.toLowerCase().includes(q) ||
        (c.brandName ?? "").toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q)
    )
  }

  if (typeFilter) {
    result = result.filter((c) => c.type === typeFilter)
  }

  return result
}

const SORT_FIELD_TYPES = {
  lastContactDate: "date",
  nextFollowUpDate: "date",
}

export function ContactsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    contacts,
    importBatches,
    accounts,
    brands,
    addContact,
    updateContact,
    deleteContact,
    deleteContacts,
    clearAllContacts,
    importContactsBatch,
    deleteImportBatch,
    storageMode,
  } = useContacts()

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const { sortField, sortDir, handleSort } = useTableSort("fullName", "asc")
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [clearAllOpen, setClearAllOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [deletingContact, setDeletingContact] = useState(null)

  const filtered = useMemo(() => {
    const rows = filterContacts(contacts, { search, typeFilter })
    return sortRowsByField(rows, sortField, sortDir, SORT_FIELD_TYPES)
  }, [contacts, search, typeFilter, sortField, sortDir])

  const pagination = usePagination(filtered, pageSize)

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered])
  const allSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id))
  const someSelected = filteredIds.some((id) => selectedIds.has(id))
  const selectedCount = selectedIds.size

  function handleToggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleToggleSelectAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredIds.forEach((id) => next.add(id))
        return next
      })
    }
  }

  function handleAdd() {
    setEditingContact(null)
    setFormOpen(true)
  }

  function handleEdit(contact) {
    setEditingContact(contact)
    setFormOpen(true)
  }

  function handleImportOpen() {
    setImportOpen(true)
  }

  async function handleCsvImport(payload) {
    try {
      const batch = await importContactsBatch(payload)
      toast(`Imported ${batch.contactCount} contact${batch.contactCount !== 1 ? "s" : ""}`)
    } catch (err) {
      toast(err?.message ?? "Import failed", "error")
      throw err
    }
  }

  async function handleFormSubmit(data) {
    const name = `${data.firstName} ${data.lastName}`.trim()
    if (editingContact) {
      await handleCloudSave(() => updateContact(editingContact.id, data), {
        onSuccess: () => toast(`Updated ${name}`),
        onError: () => toast("Failed to update contact", "error"),
      })
      return
    }

    const duplicate = findDuplicateContactForAccount(contacts, {
      accountId: data.accountId,
      email: data.email,
    })
    if (duplicate) {
      toast(
        `A contact with email ${data.email} already exists for this account`,
        "warning"
      )
      return
    }

    await handleCloudSave(() => addContact(data), {
      onSuccess: () => toast(`Added ${name}`),
      onError: () => toast("Failed to add contact", "error"),
    })
  }

  async function handleBulkDelete() {
    const count = selectedIds.size
    const ok = await handleCloudSave(() => deleteContacts([...selectedIds]), {
      onError: () => toast("Failed to delete contacts", "error"),
    })
    if (!ok) return
    setSelectedIds(new Set())
    toast(`Deleted ${count} contact${count !== 1 ? "s" : ""}`)
  }

  function handleExport() {
    downloadContactsCsv(contacts, getExportFileName())
  }

  async function handleClearAll() {
    const ok = await handleCloudSave(() => clearAllContacts(), {
      onError: () => toast("Failed to clear contacts", "error"),
    })
    if (!ok) return
    setSelectedIds(new Set())
    toast("All contacts cleared")
  }

  async function handleDeleteContact() {
    const ok = await handleCloudSave(() => deleteContact(deletingContact.id), {
      onError: () => toast("Failed to delete contact", "error"),
    })
    if (!ok) return
    toast(`Deleted ${deletingContact.fullName}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Contacts"
        description={`${contacts.length} contact${contacts.length !== 1 ? "s" : ""} tracked`}
        badge={<StorageModeBadge mode={storageMode} />}
        actions={
          <>
            {selectedCount > 0 && (
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setBulkDeleteOpen(true)}
              >
                Delete {selectedCount} Selected
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="secondary" size="sm" icon={Upload} onClick={handleImportOpen}>
              Import CSV
            </Button>
            <Button variant="primary" size="sm" icon={UserPlus} onClick={handleAdd}>
              Add Contact
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          className="flex-1"
          placeholder="Search by name, company, brand, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="">All Types</option>
          {CONTACT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={Users}
            title={contacts.length === 0 ? "No contacts yet" : "No matching contacts"}
            description={
              contacts.length === 0
                ? "Add buyers, owners, and brand reps to stay on top of relationships."
                : "Try adjusting your search or filter."
            }
            actionLabel={contacts.length === 0 ? "Add Contact" : undefined}
            onAction={contacts.length === 0 ? handleAdd : undefined}
          />
        </Card>
      ) : (
        <>
          <ContactsTable
            contacts={pagination.paginatedItems}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={(id) => navigate(`/contacts/${id}`)}
            onEdit={handleEdit}
            onDelete={setDeletingContact}
            selectable
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            allSelected={allSelected}
            someSelected={someSelected}
          />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            pageSize={pageSize}
            onPageChange={pagination.setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <ImportHistoryPanel batches={importBatches} onDeleteBatch={deleteImportBatch} />

      {contacts.length > 0 && (
        <div className="flex justify-end border-t border-zinc-800/60 pt-4">
          <Button variant="ghost" size="sm" onClick={() => setClearAllOpen(true)}>
            Clear All Contacts
          </Button>
        </div>
      )}

      <ContactFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingContact(null)
        }}
        onSubmit={handleFormSubmit}
        contact={editingContact}
        accounts={accounts}
        brands={brands}
      />

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleCsvImport}
        accounts={accounts}
        brands={brands}
        existingContacts={contacts}
      />

      <DeleteContactModal
        open={Boolean(deletingContact)}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleDeleteContact}
        contactName={deletingContact?.fullName ?? ""}
      />

      <BulkDeleteModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        count={selectedCount}
      />

      <ClearAllContactsModal
        open={clearAllOpen}
        onClose={() => setClearAllOpen(false)}
        onConfirm={handleClearAll}
        contactCount={contacts.length}
      />
    </div>
  )
}
