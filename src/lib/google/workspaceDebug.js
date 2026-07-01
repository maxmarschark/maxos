const CALENDAR_LIST_URL =
  "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1"

const GMAIL_PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile"

async function readApiError(response) {
  try {
    const body = await response.text()
    if (!body) return response.statusText || `HTTP ${response.status}`
    try {
      const json = JSON.parse(body)
      return json.error?.message ?? body
    } catch {
      return body
    }
  } catch {
    return response.statusText || `HTTP ${response.status}`
  }
}

/**
 * Probe Calendar scope via calendarList (priority service).
 */
export async function probeCalendarListAccess(accessToken) {
  if (!accessToken) {
    return { ok: false, reason: "no_token", error: "No provider_token" }
  }

  const response = await fetch(CALENDAR_LIST_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      reason: "permission_needed",
      error: await readApiError(response),
      status: response.status,
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: "fetch_failed",
      error: await readApiError(response),
      status: response.status,
    }
  }

  return { ok: true, status: response.status }
}

/**
 * Probe Gmail scope via users/me/profile.
 */
export async function probeGmailProfileAccess(accessToken) {
  if (!accessToken) {
    return { ok: false, reason: "no_token", error: "No provider_token" }
  }

  const response = await fetch(GMAIL_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      reason: "permission_needed",
      error: await readApiError(response),
      status: response.status,
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: "fetch_failed",
      error: await readApiError(response),
      status: response.status,
    }
  }

  return { ok: true, status: response.status }
}

/**
 * Runs Calendar + Gmail API probes against the current provider token.
 */
export async function runGoogleWorkspaceDebug(accessToken) {
  const hasProviderToken = Boolean(accessToken)

  if (!hasProviderToken) {
    return {
      hasProviderToken: false,
      calendar: { ok: false, error: "No provider_token" },
      gmail: { ok: false, error: "No provider_token" },
    }
  }

  const [calendar, gmail] = await Promise.all([
    probeCalendarListAccess(accessToken),
    probeGmailProfileAccess(accessToken),
  ])

  return {
    hasProviderToken: true,
    calendar,
    gmail,
  }
}
