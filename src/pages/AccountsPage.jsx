import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building2, Plus } from "lucide-react"
import { useAccounts } from "../features/accounts/useAccounts"
import { useContacts } from "../features/contacts/useContacts"
import { AccountsTable } from "../features/accounts/components/AccountsTable"
import { AccountFormModal } from "../features/accounts/components/AccountFormModal"
import { DeleteAccountModal } from "../features/accounts/components/DeleteAccountModal"
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
import { handleCloudSave } from "../lib/handleCloudSave"
import {
  buildPrimaryContactFromAccount,
  findDuplicateContactForAccount,
} from "../features/contacts/contactAccountPrefill"

function filterAccounts(accounts, { search, stateFilter }) {
  let result = [...accounts]

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (a) =>
        a.businessName.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.includes(q)
    )
  }

  if (stateFilter) {
    result = result.filter((a) => a.state === stateFilter)
  }

  return result
}

const SORT_FIELD_TYPES = {
  outstandingBalance: "number",
  lastVisit: "date",
  nextFollowUp: "date",
}

export function AccountsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { accounts, storageMode, addAccount, updateAccount, deleteAccount } = useAccounts()
  const { contacts, addContact } = useContacts()

  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState("")
  const { sortField, sortDir, handleSort } = useTableSort("businessName", "asc")
  const [pageSize, setPageSize] = useState(25)

  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [deletingAccount, setDeletingAccount] = useState(null)

  const filtered = useMemo(() => {
    const rows = filterAccounts(accounts, { search, stateFilter })
    return sortRowsByField(rows, sortField, sortDir, SORT_FIELD_TYPES)
  }, [accounts, search, stateFilter, sortField, sortDir])

  const pagination = usePagination(filtered, pageSize)

  const statesInData = useMemo(
    () => [...new Set(accounts.map((a) => a.state))].sort(),
    [accounts]
  )

  function handleEdit(account) {
    setEditingAccount(account)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditingAccount(null)
    setFormOpen(true)
  }

  async function handleFormSubmit({ account, primaryContact }) {
    if (editingAccount) {
      await handleCloudSave(() => updateAccount(editingAccount.id, account), {
        onSuccess: () => toast(`Updated ${account.businessName}`),
        onError: () => toast("Failed to update account", "error"),
      })
      return
    }

    let savedAccount = null
    const accountSaved = await handleCloudSave(() => addAccount(account), {
      onSuccess: (entity) => {
        savedAccount = entity
        toast(`Added ${account.businessName}`)
      },
      onError: () => toast("Failed to add account", "error"),
    })

    if (!accountSaved || !savedAccount || !primaryContact) return

    const contactData = buildPrimaryContactFromAccount(savedAccount, primaryContact)
    if (!contactData.firstName && !contactData.lastName) {
      toast("Account saved, but primary contact needs a name", "warning")
      return
    }

    const duplicate = findDuplicateContactForAccount(contacts, {
      accountId: savedAccount.id,
      email: contactData.email,
    })
    if (duplicate) {
      toast(
        `Account saved. Skipped primary contact — email ${contactData.email} already exists.`,
        "warning"
      )
      return
    }

    await handleCloudSave(() => addContact(contactData), {
      onSuccess: () => toast(`Created primary contact for ${savedAccount.businessName}`),
      onError: () => toast("Account saved, but primary contact failed to save", "error"),
    })
  }

  async function handleDelete() {
    const ok = await handleCloudSave(() => deleteAccount(deletingAccount.id), {
      onError: () => toast("Failed to delete account", "error"),
    })
    if (!ok) return
    toast(`Deleted ${deletingAccount.businessName}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building2}
        title="Accounts"
        description={`${accounts.length} retailer${accounts.length !== 1 ? "s" : ""} and distributor${accounts.length !== 1 ? "s" : ""}`}
        badge={<StorageModeBadge mode={storageMode} />}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleAdd}>
            Add Account
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          className="flex-1"
          placeholder="Search by name, owner, city, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">All States</option>
          {statesInData.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={Building2}
            title={accounts.length === 0 ? "No accounts yet" : "No matching accounts"}
            description={
              accounts.length === 0
                ? "Add your first retailer or distributor to get started."
                : "Try adjusting your search or filter."
            }
            actionLabel={accounts.length === 0 ? "Add Account" : undefined}
            onAction={accounts.length === 0 ? handleAdd : undefined}
          />
        </Card>
      ) : (
        <>
          <AccountsTable
            accounts={pagination.paginatedItems}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={(id) => navigate(`/accounts/${id}`)}
            onEdit={handleEdit}
            onDelete={setDeletingAccount}
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

      <AccountFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingAccount(null)
        }}
        onSubmit={handleFormSubmit}
        account={editingAccount}
      />

      <DeleteAccountModal
        open={Boolean(deletingAccount)}
        onClose={() => setDeletingAccount(null)}
        onConfirm={handleDelete}
        accountName={deletingAccount?.businessName ?? ""}
      />
    </div>
  )
}
