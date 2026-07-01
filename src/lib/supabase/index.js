export { getSupabaseConfig, getSupabaseEnvStatus, isSupabaseConfigured } from "./env"
export { getAppRedirectUrl, getSettingsOAuthRedirectUrl, SETTINGS_OAUTH_HASH_PATH, SETTINGS_OAUTH_PATH } from "./oauthRedirect"
export { getSupabaseClient, resetSupabaseClient } from "./client"
export {
  bootstrapAuthSession,
  getAuthUser,
  ensureSupabaseSession,
  getSupabaseUserId,
  signInWithGoogle,
  connectGoogleCalendar,
  getGoogleAccessToken,
  resolveGoogleCalendarStatus,
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
