import {
  logCloudPersistCloudBatch,
  logCloudPersistCloudInsert,
} from "../debug/csvImportDiagnostics"

export function isCloudMode(storageModeRef) {
  return storageModeRef.current === "cloud"
}

export function unwrapCloudEntity(result) {
  if (!result) return null
  return (
    result.row ??
    result.entity ??
    result.account ??
    result.contact ??
    result.order ??
    result.task ??
    result.deal ??
    result.brand ??
    result.event ??
    result.commission ??
    result.meta ??
    null
  )
}

export async function persistCloudInsert({ storageModeRef, insert, entity, label }) {
  logCloudPersistCloudInsert({
    label,
    storageModeRef,
    phase: "enter",
    entity,
  })

  if (!isCloudMode(storageModeRef)) {
    const result = { ok: true, local: true, entity }
    logCloudPersistCloudInsert({ label, storageModeRef, phase: "skip-not-cloud", entity, result })
    return result
  }

  const result = await insert(entity)
  if (result.ok) {
    const ok = { ok: true, entity: unwrapCloudEntity(result) ?? entity }
    logCloudPersistCloudInsert({ label, storageModeRef, phase: "success", entity, result: ok })
    return ok
  }

  console.error(`[Max OS ${label}] Cloud insert failed:`, result.error)
  logCloudPersistCloudInsert({ label, storageModeRef, phase: "failure", entity, result })
  return { ok: false, error: result.error }
}

export async function persistCloudUpdate({ storageModeRef, update, entity, label }) {
  if (!isCloudMode(storageModeRef)) {
    return { ok: true, local: true, entity }
  }

  const result = await update(entity)
  if (result.ok) {
    return { ok: true, entity: unwrapCloudEntity(result) ?? entity }
  }

  console.error(`[Max OS ${label}] Cloud update failed:`, result.error)
  return { ok: false, error: result.error }
}

export async function persistCloudDelete({ storageModeRef, remove, id, label }) {
  if (!isCloudMode(storageModeRef)) {
    return { ok: true, local: true }
  }

  const result = await remove(id)
  if (result.ok) {
    return { ok: true }
  }

  console.error(`[Max OS ${label}] Cloud delete failed:`, result.error)
  return { ok: false, error: result.error }
}

export async function persistCloudBatch({ storageModeRef, runBatch, label }) {
  logCloudPersistCloudBatch({
    label,
    storageModeRef,
    phase: "enter",
  })

  if (!isCloudMode(storageModeRef)) {
    const result = { ok: true, local: true }
    logCloudPersistCloudBatch({ label, storageModeRef, phase: "skip-not-cloud", result })
    return result
  }

  console.log("[Cloud] attempting batch insert", {
    label,
    storageModeRef: storageModeRef.current,
  })

  const result = await runBatch()
  if (result.ok) {
    logCloudPersistCloudBatch({ label, storageModeRef, phase: "success", result })
    return { ok: true }
  }

  console.error(`[Max OS ${label}] Cloud batch failed:`, {
    error: result.error,
    code: result.code,
    hint: result.hint,
    details: result.details,
    row: result.row,
    contactId: result.contactId,
  })
  logCloudPersistCloudBatch({ label, storageModeRef, phase: "failure", result })
  return { ok: false, error: result.error, code: result.code }
}
