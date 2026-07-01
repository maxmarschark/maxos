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
import { CONTACT_TYPES } from "../features/contacts/constants"
import { downloadContactsCsv, getExportFileName } from "../features/contacts/export"

function filterAndSort(contacts, { search, typeFilter, sortField, sortDir }) {
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

  result.sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (sortField === "lastContactDate" || sortField === "nextFollowUpDate") {
      aVal = aVal ? new Date(aVal).getTime() : 0
      bVal = bVal ? new Date(bVal).getTime() : 0
    } else {
      aVal = String(aVal ?? "").toLowerCase()
      bVal = String(bVal ?? "").toLowerCase()
    }

    if (aVal < bVal) return sortDir === "asc" ? -1 : 1
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1
    return 0
  })

  return result
}

export function ContactsPage() {
  const navigate = useNavigate()
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
    refreshReferences,
  } = useContacts()

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [sortField, setSortField] = useState("fullName")
  const [sortDir, setSortDir] = useState("asc")
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [clearAllOpen, setClearAllOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [deletingContact, setDeletingContact] = useState(null)

  const filtered = useMemo(
    () => filterAndSort(contacts, { search, typeFilter, sortField, sortDir }),
    [contacts, search, typeFilter, sortField, sortDir]
  )

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered])
  const allSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id))
  const someSelected = filteredIds.some((id) => selectedIds.has(id))
  const selectedCount = selectedIds.size

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

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
    refreshReferences()
    setEditingContact(null)
    setFormOpen(true)
  }

  function handleEdit(contact) {
    refreshReferences()
    setEditingContact(contact)
    setFormOpen(true)
  }

  function handleImportOpen() {
    refreshReferences()
    setImportOpen(true)
  }

  function handleFormSubmit(data) {
    if (editingContact) {
      updateContact(editingContact.id, data)
    } else {
      addContact(data)
    }
  }

  function handleBulkDelete() {
    deleteContacts([...selectedIds])
    setSelectedIds(new Set())
  }

  function handleExport() {
    downloadContactsCsv(contacts, getExportFileName())
  }

  function handleClearAll() {
    clearAllContacts()
    setSelectedIds(new Set())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            Contacts
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </div>

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
        <ContactsTable
          contacts={filtered}
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
        onImport={importContactsBatch}
        accounts={accounts}
        brands={brands}
        existingContacts={contacts}
      />

      <DeleteContactModal
        open={Boolean(deletingContact)}
        onClose={() => setDeletingContact(null)}
        onConfirm={() => deleteContact(deletingContact.id)}
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
