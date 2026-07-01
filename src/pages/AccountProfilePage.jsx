import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useAccounts } from "../features/accounts/useAccounts"
import { AccountFormModal } from "../features/accounts/components/AccountFormModal"
import { DeleteAccountModal } from "../features/accounts/components/DeleteAccountModal"
import { Tabs } from "../components/ui/Tabs"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { formatCurrency } from "../lib/format"
import { useOrders } from "../features/orders/useOrders"
import { OverviewTab } from "../features/accounts/components/tabs/OverviewTab"
import { AccountContactsTab } from "../features/contacts/components/AccountContactsTab"
import { useContacts } from "../features/contacts/useContacts"
import { AccountOrdersTab } from "../features/orders/components/AccountOrdersTab"
import { NotesTab } from "../features/accounts/components/tabs/NotesTab"
import { TasksTab } from "../features/accounts/components/tabs/TasksTab"

export function AccountProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getAccount,
    updateAccount,
    deleteAccount,
    addNote,
    deleteNote,
    addTask,
    toggleTask,
    deleteTask,
  } = useAccounts()
  const { getOrdersByAccount } = useOrders()
  const { getContactsByAccount } = useContacts()

  const account = getAccount(id)
  const [activeTab, setActiveTab] = useState("overview")
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!account) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-zinc-200">Account not found</h2>
        <p className="mt-2 text-sm text-zinc-500">
          This account may have been deleted.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => navigate("/accounts")}
        >
          Back to Accounts
        </Button>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "contacts", label: "Contacts", count: getContactsByAccount(account.id).length },
    { id: "orders", label: "Orders", count: getOrdersByAccount(account.id).length },
    { id: "notes", label: "Notes", count: account.notes.length },
    { id: "tasks", label: "Tasks", count: account.tasks.filter((t) => !t.done).length },
  ]

  function handleDelete() {
    deleteAccount(account.id)
    navigate("/accounts")
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/accounts")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft size={14} />
          Back to Accounts
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                {account.businessName}
              </h1>
              <Badge variant="default" className="normal-case tracking-normal">
                {account.state}
              </Badge>
              {account.outstandingBalance > 0 && (
                <Badge variant="danger" className="normal-case tracking-normal">
                  {formatCurrency(account.outstandingBalance)} due
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {account.owner && `${account.owner} · `}
              {account.city}
              {account.city && account.state ? ", " : ""}
              {account.state}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Pencil}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="hover:text-red-400"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === "overview" && <OverviewTab account={account} />}
        {activeTab === "contacts" && <AccountContactsTab accountId={account.id} />}
        {activeTab === "orders" && <AccountOrdersTab accountId={account.id} />}
        {activeTab === "notes" && (
          <NotesTab
            account={account}
            onAddNote={(content) => addNote(account.id, content)}
            onDeleteNote={(noteId) => deleteNote(account.id, noteId)}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            account={account}
            onAddTask={(title, dueDate) => addTask(account.id, title, dueDate)}
            onToggleTask={(taskId) => toggleTask(account.id, taskId)}
            onDeleteTask={(taskId) => deleteTask(account.id, taskId)}
          />
        )}
      </div>

      <AccountFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => updateAccount(account.id, data)}
        account={account}
      />

      <DeleteAccountModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        accountName={account.businessName}
      />
    </div>
  )
}
