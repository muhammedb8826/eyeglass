import type { UserType } from "@/types/UserType";
import { ADMIN_ROLE } from "@/constants/permissions";

/**
 * ADMIN always allowed. Otherwise requires a loaded permission list that includes `code`.
 * When `permissions` is null, permissions have not finished loading — treat as denied for gated UI.
 */
export function userHasPermission(
  user: UserType | null,
  permissions: string[] | null,
  code: string
): boolean {
  if (!user) return false;
  if (user.roles === ADMIN_ROLE) return true;
  if (permissions === null) return false;
  return permissions.includes(code);
}
