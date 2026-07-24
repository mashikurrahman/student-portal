import { redirect } from "next/navigation";
import { getOptionalUser } from "@/server/auth/session";
import { ROLE_HOME } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Neutral post-login landing that forwards each user to their role dashboard
 * (student / agent / admin). Keeps the redirect logic server-side so the login
 * form doesn't need to know the user's role.
 */
export default async function DashboardRedirect() {
  const user = await getOptionalUser();
  if (!user) redirect("/login");
  redirect(ROLE_HOME[user.role]);
}
