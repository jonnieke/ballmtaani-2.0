import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useIsAdmin } from "./useIsAdmin";

export type ContentRole = "writer" | "editor" | "publisher";

interface ContentRoleState {
  roles: ContentRole[];
  loading: boolean;
  canWrite: boolean;   // create + edit own drafts + submit
  canEdit: boolean;    // edit any article + approve/reject
  canPublish: boolean; // publish/unpublish approved articles
  isSuperAdmin: boolean;
}

const SUPER: ContentRoleState = {
  roles: ["writer", "editor", "publisher"],
  loading: false,
  canWrite: true,
  canEdit: true,
  canPublish: true,
  isSuperAdmin: true,
};

export function useContentRole(): ContentRoleState {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [state, setState] = useState<ContentRoleState>({ roles: [], loading: true, canWrite: false, canEdit: false, canPublish: false, isSuperAdmin: false });

  useEffect(() => {
    if (isAdmin) { setState(SUPER); return; }
    if (!user || !supabase) { setState(s => ({ ...s, loading: false })); return; }

    supabase
      .from("user_content_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const roles = (data?.map((r: any) => r.role) || []) as ContentRole[];
        setState({
          roles,
          loading: false,
          canWrite: roles.some(r => ["writer", "editor", "publisher"].includes(r)),
          canEdit: roles.some(r => ["editor", "publisher"].includes(r)),
          canPublish: roles.includes("publisher"),
          isSuperAdmin: false,
        });
      });
  }, [user, isAdmin]);

  return state;
}
