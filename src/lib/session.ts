import { auth } from "@/auth";
import type { UserRole } from "@/types/auth";

/** Returns session if authenticated and role is allowed */
export async function requireRole(...roles: UserRole[]) {
  const session = await auth();
  if (!session?.user?.role) return null;
  if (roles.length > 0 && !roles.includes(session.user.role)) return null;
  return session;
}
