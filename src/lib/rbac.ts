import type { Role } from "@prisma/client";

/**
 * Role-based access control. Mirrors the RBAC matrix in docs/ARCHITECTURE.md §4.
 * Authorization is ALWAYS enforced server-side — never rely on the UI to hide data.
 */
export type Permission =
  | "profile:manage"
  | "catalog:read"
  | "catalog:manage"
  | "application:create"
  | "document:upload"
  | "document:review"
  | "document:download"
  | "application:advance"
  | "application:submitToUniversity"
  | "agent:manage"
  | "student:assign"
  | "reporting:view"
  | "requirementSet:manage"
  | "agency:onboard"
  | "commission:manage"
  | "audit:view";

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  student: new Set<Permission>([
    "profile:manage",
    "catalog:read",
    "application:create",
    "document:upload",
  ]),
  agent: new Set<Permission>([
    "profile:manage",
    "catalog:read",
    "document:review",
    "document:download",
    "application:advance",
    "application:submitToUniversity",
    "reporting:view",
  ]),
  agency_admin: new Set<Permission>([
    "profile:manage",
    "catalog:read",
    "document:download",
    "agent:manage",
    "student:assign",
    "reporting:view",
    "commission:manage",
    "audit:view",
  ]),
  super_admin: new Set<Permission>([
    "profile:manage",
    "catalog:read",
    "catalog:manage",
    "document:download",
    "reporting:view",
    "requirementSet:manage",
    "agency:onboard",
    "commission:manage",
    "audit:view",
  ]),
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

/** Home dashboard path per role, used for post-login redirects. */
export const ROLE_HOME: Record<Role, string> = {
  student: "/student",
  agent: "/agent",
  agency_admin: "/admin",
  super_admin: "/admin",
};
