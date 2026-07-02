/**
 * Runs an async provider save and reports success/failure to the caller.
 * Add methods return the entity or null; update/delete return true/false.
 */
export async function handleCloudSave(action, { onSuccess, onError }) {
  try {
    const result = await action()
    if (result === null || result === false) {
      onError?.()
      return false
    }
    onSuccess?.(result)
    return true
  } catch (err) {
    onError?.(err)
    return false
  }
}
