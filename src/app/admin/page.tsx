import Link from "next/link";
import { getOptionalUser } from "@/server/auth/session";
import { agencyAdminService } from "@/server/services/agency-admin-service";
import { platformService } from "@/server/services/platform-service";
import { stageLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

async function AgencyOverview({
  user,
}: {
  user: { id: string; role: "agency_admin" | "super_admin"; agencyId: string | null; email: string };
}) {
  const report = await agencyAdminService.report(user);
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Applications" value={report.total} />
        <Stat label="Submitted" value={report.conversion.submitted} />
        <Stat label="Offers" value={report.conversion.offers} />
        <Stat label="Offer rate" value={`${Math.round(report.conversion.offerRate * 100)}%`} />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Pipeline funnel</h2>
        <ul className="mt-3 space-y-2">
          {report.funnel.map((f) => (
            <li key={f.stage} className="flex items-center gap-3">
              <span className="w-56 text-sm text-slate-600">{stageLabel(f.stage)}</span>
              <div className="h-3 flex-1 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-brand-500"
                  style={{ width: `${report.total ? (f.count / report.total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-medium text-slate-800">{f.count}</span>
            </li>
          ))}
          {report.funnel.length === 0 && <li className="text-sm text-slate-400">No applications yet.</li>}
        </ul>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Load per agent</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {report.perAgent.map((a) => (
              <li key={a.agentUserId} className="flex justify-between">
                <span className="text-slate-600">{a.agentEmail}</span>
                <span className="font-medium text-slate-800">{a.count}</span>
              </li>
            ))}
            {report.perAgent.length === 0 && <li className="text-slate-400">No assignments yet.</li>}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">By destination</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {report.byCountry.map((c) => (
              <li key={c.country} className="flex justify-between">
                <span className="text-slate-600">{c.country}</span>
                <span className="font-medium text-slate-800">{c.count}</span>
              </li>
            ))}
            {report.byCountry.length === 0 && <li className="text-slate-400">No data yet.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}

async function PlatformOverview() {
  const agencies = await platformService.listAgencies();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Agencies</h2>
        <Link href="/admin/catalog" className="text-sm font-medium text-brand-600">
          Manage catalog →
        </Link>
      </div>
      <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {agencies.map((a) => (
          <li key={a.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-medium text-slate-800">{a.name}</p>
              <p className="text-xs text-slate-500">{a._count.users} users · {a.status}</p>
            </div>
          </li>
        ))}
        {agencies.length === 0 && <li className="px-5 py-4 text-sm text-slate-400">No agencies yet.</li>}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default async function AdminOverview() {
  const user = await getOptionalUser();
  if (!user) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Overview</h1>
      {user.role === "super_admin" ? (
        <PlatformOverview />
      ) : (
        <AgencyOverview user={user as never} />
      )}
    </div>
  );
}
