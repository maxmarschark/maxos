import { useAuth } from "./useAuth"

/** True when Supabase is off, or auth session is ready for cloud writes. */
export function useAuthReady() {
  const { configured, loading } = useAuth()
  return !configured || !loading
}
