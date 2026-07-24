import { getServerSession } from "next-auth";
import type { Role } from "@prisma/client";
import { authOptions } from "./options";
import { can, type Permission } from "@/lib/rbac";
import { forbidden, unauthorized } from "@/lib/api";

export interface AuthUser {
  id: string;
  role: Role;
  agencyId: string | null;
  email: string;
}

/**
 * Returns the authenticated user or throws 401. Use at the top of every
 * protected route handler (see docs/SECURITY.md §3).
 */
export async function requireUser(): Promise<AuthUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw unauthorized();
  return {
    id: session.user.id,
    role: session.user.role,
    agencyId: session.user.agencyId,
    email: session.user.email ?? "",
  };
}

/** Returns the authenticated user or null (for server components that render gracefully). */
export async function getOptionalUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    role: session.user.role,
    agencyId: session.user.agencyId,
    email: session.user.email ?? "",
  };
}

/** Requires the user to hold a specific permission, else throws 403. */
export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) throw forbidden();
  return user;
}

/** Requires the user to be within a given agency (tenant isolation). */
export function assertSameAgency(user: AuthUser, agencyId: string): void {
  if (user.role === "super_admin") return;
  if (user.agencyId !== agencyId) throw forbidden();
}
