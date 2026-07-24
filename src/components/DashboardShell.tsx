import type { ReactNode } from "react";

export function DashboardShell({
  title,
  role,
  email,
  children,
}: {
  title: string;
  role: string;
  email: string;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-semibold text-slate-900">{title}</span>
          <span className="text-sm text-slate-500">
            {email} · <span className="font-medium capitalize">{role.replace("_", " ")}</span>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
