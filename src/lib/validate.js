export function required(value, message = "This field is required") {
  if (value == null || String(value).trim() === "") return message
  return undefined
}

export function requiredOneOf(fields, form, message) {
  const hasValue = fields.some((f) => String(form[f] ?? "").trim())
  return hasValue ? undefined : message
}

export function email(value) {
  if (!value || !String(value).trim()) return undefined
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
  return ok ? undefined : "Enter a valid email address"
}

export function collectErrors(checks) {
  return Object.fromEntries(
    Object.entries(checks).filter(([, msg]) => msg != null)
  )
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
