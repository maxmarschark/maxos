import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Users } from "lucide-react"
import { useContacts } from "../useContacts"
import { useBrands } from "../../brands/useBrands"
import { ContactsTable } from "./ContactsTable"
import { ContactFormModal } from "./ContactFormModal"
import { Card } from "../../../components/ui/Card"
import { EmptyState } from "../../../components/ui/EmptyState"
import { Button } from "../../../components/ui/Button"
import { useToast } from "../../../components/ui/useToast"
import { handleCloudSave } from "../../../lib/handleCloudSave"
import { findDuplicateContactForAccount } from "../contactAccountPrefill"

export function AccountContactsTab({ account }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { getContactsByAccount, accounts, addContact } = useContacts()
  const { brands } = useBrands()
  const [formOpen, setFormOpen] = useState(false)

  const contacts = getContactsByAccount(account.id)

  async function handleFormSubmit(data) {
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

    const name = `${data.firstName} ${data.lastName}`.trim()
    await handleCloudSave(() => addContact(data), {
      onSuccess: () => toast(`Added ${name}`),
      onError: () => toast("Failed to add contact", "error"),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setFormOpen(true)}>
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={Users}
            title="No contacts linked"
            description="Add a contact for this account — phone, email, and location will pre-fill from the account."
            actionLabel="Add Contact"
            onAction={() => setFormOpen(true)}
          />
        </Card>
      ) : (
        <ContactsTable
          contacts={contacts}
          sortField="fullName"
          sortDir="asc"
          onSort={() => {}}
          onRowClick={(id) => navigate(`/contacts/${id}`)}
          compact
        />
      )}

      <ContactFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        seedAccount={account}
        accounts={accounts}
        brands={brands}
      />
    </div>
  )
}
