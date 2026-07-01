export { getSupabaseConfig, getSupabaseEnvStatus, isSupabaseConfigured } from "./env"
export { getSupabaseClient, resetSupabaseClient } from "./client"
export {
  getAuthUser,
  ensureSupabaseSession,
  getSupabaseUserId,
  signInWithGoogle,
  connectGoogleCalendar,
  getGoogleAccessToken,
  signOut,
  getUserDisplayName,
  getUserEmail,
  getUserInitial,
  getUserAvatarUrl,
} from "./auth"
export {
  transformAccount,
  parseAccountRow,
  transformBrand,
  transformBrandProducts,
  transformContact,
  transformOrder,
  transformCommission,
  transformTask,
  transformActivityEvent,
  transformLocalDataForSupabase,
  buildActivityEventsFromLocalData,
} from "./transformers"
export {
  MIGRATION_FORMAT_VERSION,
  readLocalStorageForMigration,
  prepareMigrationPayload,
  serializeMigrationPayload,
  downloadMigrationPayload,
  uploadMigrationPayload,
  migrateLocalStorageToSupabase,
} from "./migrateLocalStorage"
