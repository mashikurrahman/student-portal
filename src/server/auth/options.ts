import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * NextAuth (Auth.js) configuration. Credentials provider with Argon2 verification.
 * The session JWT carries userId, role, and agencyId so RBAC checks never need a
 * DB round-trip (see docs/ARCHITECTURE.md §3).
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();

        // Throttle credential attempts per identity to blunt brute force
        // (in-memory now; Redis-backed at M2 — same interface). SECURITY §2/§6.
        const key = `login:${email}`;
        if (!rateLimiter.check(key, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs).allowed) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        // Uniform failure to avoid account enumeration (docs/SECURITY.md §2).
        if (!user || user.status === "disabled") return null;

        const valid = await verifyPassword(user.passwordHash, parsed.data.password);
        if (!valid) return null;
        if (!user.emailVerifiedAt) return null;

        // Successful auth clears the throttle for this identity.
        rateLimiter.reset(key);

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          agencyId: user.agencyId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.agencyId = user.agencyId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
        session.user.agencyId = token.agencyId;
      }
      return session;
    },
  },
};
