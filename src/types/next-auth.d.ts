import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/**
 * Augments NextAuth types with our custom session/JWT fields (role, agencyId).
 */
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    agencyId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      agencyId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: Role;
    agencyId: string | null;
  }
}
