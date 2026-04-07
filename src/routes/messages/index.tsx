import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Flag, AlertTriangle, Ban } from "lucide-react";
import { supabase } from "../../utils/supabase";
import AdminLayout from "../../components/admin/AdminLayout";

export const Route = createFileRoute("/messages/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: ReportsPage,
});

interface Report {
  uuid: string;
  reporter_profile_id: string;
  reported_profile_id: string;
  report_reason: string;
  report_details: string;
  reported_at: string;
  is_resolved: boolean;
  reporter_name?: string;
  reported_name?: string;
}

const REASON_COLORS: Record<string, string> = {
  spam: "bg-amber-100 text-amber-700",
  harassment: "bg-red-100 text-red-700",
  fake: "bg-orange-100 text-orange-700",
  inappropriate: "bg-purple-100 text-purple-700",
  scam: "bg-primary-100 text-primary-700",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filtered, setFiltered] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blocking, setBlocking] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("user_reports")
      .select(
        "uuid, reporter_profile_id, reported_profile_id, report_reason, report_details, reported_at, is_resolved",
      )
      .order("reported_at", { ascending: false })
      .limit(200);

    if (!data) {
      setLoading(false);
      return;
    }

    // Resolve names for reporters and reported users
    const ids = [
      ...new Set(
        [
          ...data.map((r: any) => r.reporter_profile_id),
          ...data.map((r: any) => r.reported_profile_id),
        ].filter(Boolean),
      ),
    ];

    let nameMap: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("uuid, fullname")
        .in("uuid", ids);
      for (const p of profiles ?? []) {
        nameMap[p.uuid] = p.fullname;
      }
    }

    const result: Report[] = data.map((r: any) => ({
      uuid: r.uuid,
      reporter_profile_id: r.reporter_profile_id,
      reported_profile_id: r.reported_profile_id,
      report_reason: r.report_reason,
      report_details: r.report_details,
      reported_at: r.reported_at,
      is_resolved: r.is_resolved,
      reporter_name: nameMap[r.reporter_profile_id],
      reported_name: nameMap[r.reported_profile_id],
    }));

    setReports(result);
    setFiltered(result);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(reports);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      reports.filter(
        (r) =>
          (r.reporter_name ?? "").toLowerCase().includes(q) ||
          (r.reported_name ?? "").toLowerCase().includes(q) ||
          (r.report_reason ?? "").toLowerCase().includes(q) ||
          (r.report_details ?? "").toLowerCase().includes(q),
      ),
    );
  }, [search, reports]);

  async function handleBlock(reportedId: string, reportUuid: string) {
    if (
      !confirm("Block this user? They will be added to the blocked users list.")
    )
      return;
    setBlocking(reportUuid);

    // Insert a block record using a system/admin sentinel ID
    // We use the reported profile id as blocked_profile_id
    await supabase.from("blocked_users").insert({
      blocker_profile_id: reportedId, // self-block by admin action — marks the user as blocked
      blocked_profile_id: reportedId,
    });

    // Mark the report as resolved
    await supabase
      .from("user_reports")
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq("uuid", reportUuid);

    setReports((prev) =>
      prev.map((r) =>
        r.uuid === reportUuid ? { ...r, is_resolved: true } : r,
      ),
    );
    setBlocking(null);
  }

  return (
    <AdminLayout title="Reports">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-sm shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by user, reason or details…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
          />
        </div>
        <p className="ml-auto text-sm text-gray-400">
          {filtered.length} report{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Flag className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold text-gray-800">
            User Reports
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Loading reports…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Reporter</th>
                  <th className="px-5 py-3">Reported User</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr
                    key={r.uuid}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      {r.reporter_name ?? (
                        <span className="font-mono text-xs text-gray-400">
                          {(r.reporter_profile_id ?? "—").slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      {r.reported_name ?? (
                        <span className="font-mono text-xs text-gray-400">
                          {(r.reported_profile_id ?? "—").slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {r.report_reason ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${REASON_COLORS[r.report_reason.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {r.report_reason}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                      {r.report_details || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.is_resolved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {r.is_resolved ? "Resolved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(r.reported_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        title="Block reported user"
                        disabled={blocking === r.uuid || r.is_resolved}
                        onClick={() =>
                          handleBlock(r.reported_profile_id, r.uuid)
                        }
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Block
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
