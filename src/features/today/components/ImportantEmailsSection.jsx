import { useState } from "react"
import { ExternalLink, Mail } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { useGmail } from "../../gmail/useGmail"
import { GMAIL_STATUS } from "../../gmail/constants"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { formatDate } from "../../../lib/format"

const LIMIT = 5

function EmailRow({ email }) {
  return (
    <a
      href={email.webLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 transition-colors hover:border-zinc-700/80"
    >
      <div className="flex items-start gap-2">
        <Mail size={14} className="mt-0.5 shrink-0 text-zinc-500" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[13px] font-medium text-zinc-200">{email.subject}</p>
            <ExternalLink size={12} className="mt-0.5 shrink-0 text-zinc-600" aria-hidden="true" />
          </div>
          <p className="truncate text-xs text-zinc-500">{email.fromName || email.fromEmail}</p>
          {email.snippet && (
            <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600">{email.snippet}</p>
          )}
          {email.receivedAt && (
            <p className="mt-1 text-[10px] text-zinc-600">{formatDate(email.receivedAt)}</p>
          )}
        </div>
      </div>
    </a>
  )
}

export function ImportantEmailsSection() {
  const { importantEmails, status, loading } = useGmail()
  const [expanded, setExpanded] = useState(false)

  if (status === GMAIL_STATUS.NOT_CONNECTED) {
    return (
      <Card padding="md" className="flex min-h-[220px] flex-col">
        <SectionHeader title="Important Emails" />
        <SectionEmpty>Connect Gmail in Settings to see actionable unread emails.</SectionEmpty>
      </Card>
    )
  }

  if (status === GMAIL_STATUS.PERMISSION_NEEDED) {
    return (
      <Card padding="md" className="flex min-h-[220px] flex-col">
        <SectionHeader title="Important Emails" />
        <SectionEmpty>Gmail permission needed — connect in Settings.</SectionEmpty>
      </Card>
    )
  }

  const visible = expanded ? importantEmails : importantEmails.slice(0, LIMIT)

  return (
    <Card padding="md" className="flex min-h-[220px] flex-col">
      <SectionHeader title="Important Emails" count={importantEmails.length} />
      {loading && importantEmails.length === 0 ? (
        <SectionEmpty>Loading unread emails…</SectionEmpty>
      ) : importantEmails.length === 0 ? (
        <SectionEmpty>No unread emails likely needing action.</SectionEmpty>
      ) : (
        <>
          <div className="space-y-1.5">
            {visible.map((email) => (
              <EmailRow key={email.id} email={email} />
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <ViewAllToggle
              expanded={expanded}
              total={importantEmails.length}
              limit={LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
