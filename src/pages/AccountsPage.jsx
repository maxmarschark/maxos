import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building2, Plus } from "lucide-react"
import { useAccounts } from "../features/accounts/useAccounts"
import { AccountsTable } from "../features/accounts/components/AccountsTable"
import { AccountFormModal } from "../features/accounts/components/AccountFormModal"
import { DeleteAccountModal } from "../features/accounts/components/DeleteAccountModal"
import { Button } from "../components/ui/Button"
import { SearchInput } from "../components/ui/SearchInput"
import { Select } from "../components/ui/Select"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"

function filterAndSort(accounts, { search, stateFilter, sortField, sortDir }) {
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

  result.sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (sortField === "outstandingBalance") {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
    } else if (sortField === "lastVisit" || sortField === "nextFollowUp") {
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

export function AccountsPage() {
  const navigate = useNavigate()
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts()

  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState("")
  const [sortField, setSortField] = useState("businessName")
  const [sortDir, setSortDir] = useState("asc")

  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [deletingAccount, setDeletingAccount] = useState(null)

  const filtered = useMemo(
    () => filterAndSort(accounts, { search, stateFilter, sortField, sortDir }),
    [accounts, search, stateFilter, sortField, sortDir]
  )

  const statesInData = useMemo(
    () => [...new Set(accounts.map((a) => a.state))].sort(),
    [accounts]
  )

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function handleEdit(account) {
    setEditingAccount(account)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditingAccount(null)
    setFormOpen(true)
  }

  function handleFormSubmit(data) {
    if (editingAccount) {
      updateAccount(editingAccount.id, data)
    } else {
      addAccount(data)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            Accounts
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {accounts.length} retailer{accounts.length !== 1 ? "s" : ""} and distributor
            {accounts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={handleAdd}>
          Add Account
        </Button>
      </div>

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
        <AccountsTable
          accounts={filtered}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={(id) => navigate(`/accounts/${id}`)}
          onEdit={handleEdit}
          onDelete={setDeletingAccount}
        />
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
        onConfirm={() => deleteAccount(deletingAccount.id)}
        accountName={deletingAccount?.businessName ?? ""}
      />
    </div>
  )
}
