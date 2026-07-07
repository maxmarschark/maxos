import { useState } from "react"
import { ExternalLink, Mail } from "lucide-react"
import { Card } from "../../../components/ui/Card"
import { SectionEmpty } from "../../../components/ui/SectionEmpty"
import { useGmail } from "../../gmail/useGmail"
import { GMAIL_STATUS } from "../../gmail/constants"
import { SectionHeader } from "./SectionHeader"
import { ViewAllToggle } from "./ViewAllToggle"
import { formatDate } from "../../../lib/format"
import {
  dashboardCardClass,
  dashboardFooterClass,
  dashboardListClass,
  dashboardRowClass,
} from "./dashboardLayout"
import { cn } from "../../../lib/cn"

const LIMIT = 5

function EmailRow({ email }) {
  return (
    <a
      href={email.webLink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(dashboardRowClass, "block transition-colors hover:border-zinc-700/80")}
    >
      <div className="flex items-start gap-2">
        <Mail size={14} className="mt-0.5 shrink-0 text-zinc-500" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-200">
            {email.subject}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {email.fromName || email.fromEmail}
          </p>
          {email.snippet && (
            <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600">{email.snippet}</p>
          )}
          {email.receivedAt && (
            <p className="mt-1 text-[10px] text-zinc-600">{formatDate(email.receivedAt)}</p>
          )}
        </div>
        <ExternalLink size={12} className="mt-0.5 shrink-0 text-zinc-600" aria-hidden="true" />
      </div>
    </a>
  )
}

function ImportantEmailsCard({ children, count }) {
  return (
    <Card padding="md" className={dashboardCardClass}>
      <SectionHeader title="Important Emails" count={count} />
      {children}
    </Card>
  )
}

export function ImportantEmailsSection() {
  const { importantEmails, status, loading } = useGmail()
  const [expanded, setExpanded] = useState(false)

  if (status === GMAIL_STATUS.NOT_CONNECTED) {
    return (
      <ImportantEmailsCard>
        <SectionEmpty centered>
          Connect Google Workspace in Settings to see actionable unread emails.
        </SectionEmpty>
      </ImportantEmailsCard>
    )
  }

  if (status === GMAIL_STATUS.PERMISSION_NEEDED) {
    return (
      <ImportantEmailsCard>
        <SectionEmpty centered>
          Gmail permission needed — connect Google Workspace in Settings.
        </SectionEmpty>
      </ImportantEmailsCard>
    )
  }

  const visible = expanded ? importantEmails : importantEmails.slice(0, LIMIT)

  return (
    <ImportantEmailsCard count={importantEmails.length}>
      {loading && importantEmails.length === 0 ? (
        <SectionEmpty centered>Loading unread emails…</SectionEmpty>
      ) : importantEmails.length === 0 ? (
        <SectionEmpty centered>No unread emails likely needing action.</SectionEmpty>
      ) : (
        <>
          <div className={dashboardListClass}>
            {visible.map((email) => (
              <EmailRow key={email.id} email={email} />
            ))}
          </div>
          <div className={dashboardFooterClass}>
            <ViewAllToggle
              expanded={expanded}
              total={importantEmails.length}
              limit={LIMIT}
              onToggle={() => setExpanded((v) => !v)}
            />
          </div>
        </>
      )}
    </ImportantEmailsCard>
  )
}
