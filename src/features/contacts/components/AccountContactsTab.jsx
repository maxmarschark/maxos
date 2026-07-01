import { useNavigate } from "react-router-dom"
import { Users } from "lucide-react"
import { useContacts } from "../useContacts"
import { ContactsTable } from "./ContactsTable"
import { Card } from "../../../components/ui/Card"
import { EmptyState } from "../../../components/ui/EmptyState"

export function AccountContactsTab({ accountId }) {
  const navigate = useNavigate()
  const { getContactsByAccount } = useContacts()
  const contacts = getContactsByAccount(accountId)

  if (contacts.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          icon={Users}
          title="No contacts linked"
          description="Contacts for this account will appear here when linked."
        />
      </Card>
    )
  }

  return (
    <ContactsTable
      contacts={contacts}
      sortField="fullName"
      sortDir="asc"
      onSort={() => {}}
      onRowClick={(id) => navigate(`/contacts/${id}`)}
      compact
    />
  )
}
