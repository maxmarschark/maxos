import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Form, FormField } from "../../../components/ui/Form"
import { Select } from "../../../components/ui/Select"
import { Textarea } from "../../../components/ui/Textarea"
import { getTodayISO } from "../utils"

export function LogVisitModal({ open, onClose, accounts, onSubmit }) {
  const [accountId, setAccountId] = useState("")
  const [notes, setNotes] = useState("")

  function handleClose() {
    setAccountId("")
    setNotes("")
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!accountId) return
    onSubmit(accountId, notes.trim())
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Log Visit"
      description="Record a store visit and update last visit date."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="log-visit-form" disabled={!accountId}>
            Log Visit
          </Button>
        </>
      }
    >
      <Form id="log-visit-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormField label="Account" htmlFor="visitAccount" required>
            <Select
              id="visitAccount"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">Select account...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.businessName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Notes" htmlFor="visitNotes">
            <Textarea
              id="visitNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What happened on the visit?"
              className="min-h-[72px]"
            />
          </FormField>
          <p className="text-xs text-zinc-600">
            Last visit will be set to {getTodayISO()}.
          </p>
        </div>
      </Form>
    </Modal>
  )
}
