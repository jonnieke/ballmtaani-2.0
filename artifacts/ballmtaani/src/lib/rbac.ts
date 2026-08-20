/**
 * BallMtaani Role-Based Access Control (RBAC) Engine
 * Least-privilege permission matrix for platform roles.
 */

export type UserRole =
  | "platform_admin"
  | "editor"
  | "moderator"
  | "creator"
  | "club_partner"
  | "commercial_manager"
  | "fan";

export type Permission =
  | "manage_users"
  | "publish_article"
  | "moderate_content"
  | "create_club_announcement"
  | "manage_ad_campaigns"
  | "view_analytics";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  platform_admin: ["manage_users", "publish_article", "moderate_content", "create_club_announcement", "manage_ad_campaigns", "view_analytics"],
  editor: ["publish_article", "moderate_content", "create_club_announcement", "view_analytics"],
  moderator: ["moderate_content"],
  creator: ["publish_article"],
  club_partner: ["create_club_announcement"],
  commercial_manager: ["manage_ad_campaigns", "view_analytics"],
  fan: [],
};

export function hasPermission(role: UserRole = "fan", permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
