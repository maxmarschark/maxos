import { INBOX_FETCH_LIMIT } from "../../features/gmail/constants"

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me"

const INBOX_QUERY =
  "is:unread in:inbox -category:promotions -category:social -category:updates -category:forums"

const ACTION_SUBJECT_PATTERN =
  /\b(urgent|asap|action required|reply needed|please respond|follow[- ]?up|deadline|time sensitive|waiting for your|needs your attention)\b/i

const NO_REPLY_PATTERN = /^(no[-_.]?reply|donotreply|notifications|mailer-daemon|noreply)/i

function headerValue(headers, name) {
  const header = headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())
  return header?.value ?? ""
}

function parseFromAddress(fromHeader) {
  const match = fromHeader.match(/<([^>]+)>/)
  const email = (match?.[1] ?? fromHeader).trim().toLowerCase()
  const name = match ? fromHeader.replace(/<[^>]+>/, "").trim().replace(/^"|"$/g, "") : email
  return { name: name || email, email }
}

export function parseGmailMessage(message) {
  const headers = message.payload?.headers ?? []
  const fromHeader = headerValue(headers, "From")
  const { name: fromName, email: fromEmail } = parseFromAddress(fromHeader)
  const subject = headerValue(headers, "Subject") || "(No subject)"
  const dateHeader = headerValue(headers, "Date")
  const receivedAt = dateHeader ? new Date(dateHeader).toISOString() : null

  return {
    id: message.id,
    threadId: message.threadId,
    fromName,
    fromEmail,
    subject,
    snippet: message.snippet ?? "",
    receivedAt,
    labelIds: message.labelIds ?? [],
    webLink: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
    isUnread: message.labelIds?.includes("UNREAD") ?? false,
  }
}

export function scoreActionLikelihood(email) {
  let score = 0

  if (email.labelIds.includes("IMPORTANT")) score += 4
  if (email.labelIds.includes("STARRED")) score += 3
  if (ACTION_SUBJECT_PATTERN.test(email.subject)) score += 3
  if (/\?/.test(email.subject)) score += 1
  if (NO_REPLY_PATTERN.test(email.fromEmail.split("@")[0] ?? "")) score -= 5
  if (/^(newsletter|digest|notification|alert@|updates@)/i.test(email.fromEmail)) score -= 2
  if (/\b(unsubscribe|view in browser)\b/i.test(email.snippet)) score -= 2

  return score
}

export function isLikelyActionRequired(email) {
  if (!email.isUnread) return false
  if (NO_REPLY_PATTERN.test(email.fromEmail.split("@")[0] ?? "")) return false
  return scoreActionLikelihood(email) >= 0
}

export function pickImportantEmails(emails, limit = 8) {
  return [...emails]
    .filter(isLikelyActionRequired)
    .sort((a, b) => {
      const scoreDiff = scoreActionLikelihood(b) - scoreActionLikelihood(a)
      if (scoreDiff !== 0) return scoreDiff
      return new Date(b.receivedAt ?? 0) - new Date(a.receivedAt ?? 0)
    })
    .slice(0, limit)
}

async function fetchMessageMetadata(accessToken, messageId) {
  const params = new URLSearchParams({
    format: "metadata",
    metadataHeaders: "From",
  })
  params.append("metadataHeaders", "Subject")
  params.append("metadataHeaders", "Date")

  const response = await fetch(`${GMAIL_BASE}/messages/${messageId}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    return { ok: false, status: response.status }
  }

  const data = await response.json()
  return { ok: true, message: parseGmailMessage(data) }
}

export async function probeGmailAccess(accessToken) {
  const response = await fetch(`${GMAIL_BASE}/messages?maxResults=1`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      reason: "permission_needed",
      error: `Gmail access denied (${response.status})`,
    }
  }

  if (!response.ok) {
    const message = await response.text()
    return {
      ok: false,
      reason: "fetch_failed",
      error: message || response.statusText,
    }
  }

  return { ok: true }
}

export async function fetchGmailInbox(accessToken, { maxResults = INBOX_FETCH_LIMIT } = {}) {
  const listParams = new URLSearchParams({
    q: INBOX_QUERY,
    maxResults: String(maxResults),
  })

  const listResponse = await fetch(`${GMAIL_BASE}/messages?${listParams.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (listResponse.status === 401 || listResponse.status === 403) {
    return {
      ok: false,
      reason: "permission_needed",
      error: `Gmail access denied (${listResponse.status})`,
    }
  }

  if (!listResponse.ok) {
    const message = await listResponse.text()
    return {
      ok: false,
      reason: "fetch_failed",
      error: message || listResponse.statusText,
    }
  }

  const listData = await listResponse.json()
  const messageIds = (listData.messages ?? []).map((item) => item.id)

  if (messageIds.length === 0) {
    return { ok: true, emails: [], importantEmails: [] }
  }

  const results = await Promise.all(messageIds.map((id) => fetchMessageMetadata(accessToken, id)))
  const emails = results.filter((r) => r.ok).map((r) => r.message)

  return {
    ok: true,
    emails,
    importantEmails: pickImportantEmails(emails),
  }
}
