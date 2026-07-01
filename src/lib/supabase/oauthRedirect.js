/** Hash route for Settings (in-app path is still /settings). */
export const SETTINGS_OAUTH_HASH_PATH = "/#/settings"

/**
 * Exact redirect URL for Google Calendar OAuth:
 * window.location.origin + "/#/settings"
 */
export function getSettingsOAuthRedirectUrl() {
  if (typeof window === "undefined") {
    return SETTINGS_OAUTH_HASH_PATH
  }
  return `${window.location.origin}/#/settings`
}

/**
 * Build OAuth redirect URLs for hash-based routing.
 * @param {string} path - App route, e.g. "/" or "/settings"
 */
export function getAppRedirectUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const hashPath = normalized === "/" ? "#/" : `#${normalized}`

  if (typeof window === "undefined") {
    return hashPath
  }
  return `${window.location.origin}/${hashPath}`
}

/** @deprecated Use SETTINGS_OAUTH_HASH_PATH */
export const SETTINGS_OAUTH_PATH = SETTINGS_OAUTH_HASH_PATH
