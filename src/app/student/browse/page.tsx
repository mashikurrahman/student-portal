import { BrowseExplorer } from "./BrowseExplorer";

export default function BrowsePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Browse programs</h1>
      <p className="mt-1 text-sm text-slate-600">
        Pick a country and university, check your eligibility, and start an application.
      </p>
      <div className="mt-6">
        <BrowseExplorer />
      </div>
    </div>
  );
}
