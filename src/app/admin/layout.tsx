import Link from "next/link";
import { getOptionalUser } from "@/server/auth/session";
import { SignOutButton } from "@/components/SignOutButton";

const AGENCY_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/commissions", label: "Commissions" },
  { href: "/admin/audit", label: "Audit log" },
];

const PLATFORM_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/requirements", label: "Requirements" },
  { href: "/admin/audit", label: "Audit log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalUser();
  const nav = user?.role === "super_admin" ? PLATFORM_NAV : AGENCY_NAV;
  const title = user?.role === "super_admin" ? "Platform Admin" : "Agency Admin";

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-slate-900">{title}</span>
            <nav className="flex gap-4 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-slate-600 hover:text-slate-900">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
