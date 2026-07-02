/** Debug-only instrumentation for CSV import / cloud mode tracing. Remove when done debugging. */

export function logCsvRowsParsed(result) {
  console.log("[CSV] rows parsed", {
    rowCount: result.rows?.length ?? 0,
    headers: result.headers,
    errors: result.errors,
    rows: result.rows,
  })
}

export function logCsvRowsToContacts(contacts) {
  console.log("[CSV] rows mapped to contacts", {
    count: contacts.length,
    contacts,
  })
}

export function logContactsRowsReceived({ fileName, itemCount, items, duplicateActions }) {
  console.log("[Contacts] rows received", {
    fileName,
    itemCount,
    duplicateActions,
    items,
  })
}

export function logContactsImportPlan({ toSyncCount, batchId, storageMode }) {
  console.log("[Contacts] import plan built", {
    toSyncCount,
    batchId,
    storageMode,
  })
}

export function logCloudAttemptingBatchInsert({ count, storageModeRef }) {
  console.log("[Cloud] attempting batch insert", {
    count,
    storageModeRef: storageModeRef?.current,
  })
}

export function logCloudPersistCloudBatch({ label, storageModeRef, phase, result }) {
  console.log("[Cloud] persistCloudBatch()", {
    label,
    phase,
    storageModeRef: storageModeRef?.current,
    result,
  })
}

export function logCloudPersistCloudInsert({ label, storageModeRef, phase, entity, result }) {
  console.log("[Cloud] persistCloudInsert()", {
    label,
    phase,
    storageModeRef: storageModeRef?.current,
    entityId: entity?.id,
    result,
  })
}

export function logSupabasePayload({ operation, table, payload, rowIndex, total }) {
  console.log("[Supabase] payload", {
    operation,
    table,
    rowIndex,
    total,
    payload,
  })
}

export function logSupabaseResponse({ operation, table, rowIndex, data }) {
  console.log("[Supabase] response", {
    operation,
    table,
    rowIndex,
    data,
  })
}

export function logSupabaseError({ operation, table, rowIndex, error }) {
  console.error("[Supabase] error", {
    operation,
    table,
    rowIndex,
    message: error?.message ?? error?.error ?? error,
    code: error?.code,
    hint: error?.hint,
    details: error?.details,
    raw: error,
  })
}

export function logCloudRemainingInCloudMode({ label, storageModeRef, context }) {
  console.log("[Cloud] remaining in cloud mode", {
    label,
    storageModeRef: storageModeRef?.current,
    isCloud: storageModeRef?.current === "cloud",
    context,
  })
}

export function logSetMode(moduleName, mode, previousMode) {
  console.log("[Cloud] setMode()", {
    module: moduleName,
    mode,
    previousMode,
  })
  if (mode === "local") {
    console.trace('[Cloud] setMode("local") STACK TRACE')
  }
}

export function logFallBackToLocal(moduleName, reason) {
  console.warn("[Cloud] fallBackToLocal()", {
    module: moduleName,
    reason,
  })
  console.trace("[Cloud] fallBackToLocal() STACK TRACE")
}
