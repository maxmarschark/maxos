import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useContacts } from "../features/contacts/useContacts"
import { useOrders } from "../features/orders/useOrders"
import { useTasks } from "../features/tasks/useTasks"
import { useBrands } from "../features/brands/useBrands"
import { ContactFormModal } from "../features/contacts/components/ContactFormModal"
import { DeleteContactModal } from "../features/contacts/components/DeleteContactModal"
import { CreateFollowUpButton } from "../features/tasks/components/CreateFollowUpButton"
import { buildFollowUpFromContact } from "../features/tasks/utils"
import { getTodayISO } from "../features/today/utils"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card } from "../components/ui/Card"
import { EntityLink } from "../components/ui/EntityLink"
import { formatDate } from "../lib/format"
import { ContactOrdersSection } from "../features/contacts/components/ContactOrdersSection"
import { ContactTasksSection } from "../features/contacts/components/ContactTasksSection"
import { ContactFollowUpHistory } from "../features/contacts/components/ContactFollowUpHistory"
import { TYPE_VARIANTS } from "../features/contacts/constants"
import { useToast } from "../components/ui/useToast"

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-sm text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-200 sm:text-right">{children}</dd>
    </div>
  )
}

export function ContactProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getContact, updateContact, deleteContact, accounts } = useContacts()
  const { orders } = useOrders()
  const { addTask, tasks } = useTasks()
  const { brands } = useBrands()
  const { toast } = useToast()

  const contact = getContact(id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!contact) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-zinc-200">Contact not found</h2>
        <p className="mt-2 text-sm text-zinc-500">This contact may have been deleted.</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => navigate("/contacts")}
        >
          Back to Contacts
        </Button>
      </div>
    )
  }

  function handleDelete() {
    deleteContact(contact.id)
    navigate("/contacts")
  }

  function handleEdit() {
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/contacts")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft size={14} />
          Back to Contacts
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                {contact.fullName}
              </h1>
              <Badge variant={TYPE_VARIANTS[contact.type] ?? "default"}>
                {contact.type}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {contact.role || "No role set"}
              {contact.companyDisplay !== "—" && ` · ${contact.companyDisplay}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Pencil} onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="md" className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-300">Overview</h2>
          <dl className="space-y-3">
            <DetailRow label="Phone">
              {contact.phone ? (
                <a href={`tel:${contact.phone}`} className="text-indigo-400 hover:text-indigo-300">
                  {contact.phone}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="Email">
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  {contact.email}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="Preferred Method">{contact.preferredContactMethod}</DetailRow>
            <DetailRow label="Location">
              {[contact.city, contact.state].filter(Boolean).join(", ") || "—"}
            </DetailRow>
          </dl>
        </Card>

        <Card padding="md" className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-300">Follow-up</h2>
          <dl className="space-y-3">
            <DetailRow label="Last Contact">{formatDate(contact.lastContactDate)}</DetailRow>
            <DetailRow label="Next Follow-up">
              <span
                className={
                  contact.nextFollowUpDate &&
                  contact.nextFollowUpDate < getTodayISO()
                    ? "text-amber-400"
                    : undefined
                }
              >
                {formatDate(contact.nextFollowUpDate)}
              </span>
            </DetailRow>
          </dl>
          <CreateFollowUpButton
            label="Create Follow-up Task"
            initialValues={buildFollowUpFromContact(contact, getTodayISO())}
            accounts={accounts}
            contacts={[contact]}
            brands={brands}
            orders={orders}
            onCreate={(data) => {
              addTask(data)
              toast(`Follow-up task created for ${contact.fullName}`)
            }}
          />
        </Card>

        <Card padding="md" className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-300">Linked Account</h2>
          {contact.accountId ? (
            <dl className="space-y-3">
              <DetailRow label="Account">
                <EntityLink to={`/accounts/${contact.accountId}`}>
                  {contact.accountName}
                </EntityLink>
              </DetailRow>
            </dl>
          ) : (
            <p className="text-sm text-zinc-600">
              {contact.company ? (
                <>Company: {contact.company} (not linked to an account)</>
              ) : (
                "No account linked."
              )}
            </p>
          )}
        </Card>

        <Card padding="md" className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-300">Linked Brand</h2>
          {contact.brandId ? (
            <dl className="space-y-3">
              <DetailRow label="Brand">
                <EntityLink to={`/brands/${contact.brandId}`}>
                  {contact.brandName}
                </EntityLink>
              </DetailRow>
            </dl>
          ) : (
            <p className="text-sm text-zinc-600">No brand linked.</p>
          )}
        </Card>

        {contact.notes && (
          <Card padding="md" className="space-y-2 lg:col-span-2">
            <h2 className="text-sm font-medium text-zinc-300">Notes</h2>
            <p className="text-sm leading-relaxed text-zinc-400">{contact.notes}</p>
          </Card>
        )}
      </div>

      <Card padding="md" className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">Orders Involved</h2>
        <ContactOrdersSection contact={contact} orders={orders} />
      </Card>

      <Card padding="md" className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">Open Tasks</h2>
        <ContactTasksSection contactId={contact.id} tasks={tasks} />
      </Card>

      <Card padding="md" className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">Follow-up History</h2>
        <ContactFollowUpHistory contact={contact} tasks={tasks} />
      </Card>

      <ContactFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => updateContact(contact.id, data)}
        contact={contact}
        accounts={accounts}
        brands={brands}
      />

      <DeleteContactModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        contactName={contact.fullName}
      />
    </div>
  )
}
