import { useAuth } from "../context/AuthContext";

const ADMIN_IDS = (import.meta.env.VITE_ADMIN_USER_IDS || "")
  .split(",")
  .map((id: string) => id.trim())
  .filter(Boolean);

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return ADMIN_IDS.includes(user.id);
}
