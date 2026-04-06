import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Filter, Ban, CheckCircle, Trash2, Eye } from "lucide-react";
import { supabase } from "../../utils/supabase";
import AdminLayout from "../../components/admin/AdminLayout";

export const Route = createFileRoute("/users/")({
  component: UsersPage,
});

interface Profile {
  uuid: string;
  fullname: string;
  username: string;
  email: string;
  dob?: string;
  gender?: string; // resolved from genders join
  location_city?: string;
  location_country?: string;
  is_active?: boolean;
  is_profile_complete?: boolean;
  created_at: string;
}

const COLORS = [
  "bg-rose-400",
  "bg-violet-400",
  "bg-sky-400",
  "bg-amber-400",
  "bg-teal-400",
  "bg-pink-400",
];

function avatar(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function calcAge(dob?: string): number | null {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function StatusBadge({ user }: { user: Profile }) {
  if (!user.is_active)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Inactive
      </span>
    );
  if (user.is_profile_complete)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Complete
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      Incomplete
    </span>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "complete" | "inactive" | "incomplete"
  >("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select(
          "uuid, fullname, username, email, dob, location_city, location_country, is_active, is_profile_complete, created_at, genders(gender)",
        )
        .order("created_at", { ascending: false })
        .limit(200);

      const result: Profile[] = (data ?? []).map((row: any) => ({
        uuid: row.uuid,
        fullname: row.fullname,
        username: row.username,
        email: row.email,
        dob: row.dob,
        gender: row.genders?.gender ?? undefined,
        location_city: row.location_city,
        location_country: row.location_country,
        is_active: row.is_active,
        is_profile_complete: row.is_profile_complete,
        created_at: row.created_at,
      }));

      setUsers(result);
      setFiltered(result);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.fullname ?? "").toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q) ||
          (u.username ?? "").toLowerCase().includes(q),
      );
    }
    if (filter === "complete")
      list = list.filter((u) => u.is_profile_complete && u.is_active !== false);
    if (filter === "inactive") list = list.filter((u) => !u.is_active);
    if (filter === "incomplete")
      list = list.filter(
        (u) => !u.is_profile_complete && u.is_active !== false,
      );
    setFiltered(list);
    setPage(1);
  }, [search, filter, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminLayout title="Users">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-sm shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, username or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {(["all", "complete", "inactive", "incomplete"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-rose-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <p className="ml-auto text-sm text-gray-400">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Loading users…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Age</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map((user, i) => (
                  <tr
                    key={user.uuid}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                        >
                          {avatar(user.fullname ?? "")}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {user.fullname}
                          </p>
                          <p className="text-xs text-gray-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {calcAge(user.dob) ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600 capitalize">
                      {user.gender ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {[user.location_city, user.location_country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge user={user} />
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="View"
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title={
                            user.is_profile_complete
                              ? "Mark incomplete"
                              : "Mark complete"
                          }
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title={user.is_active ? "Deactivate" : "Activate"}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
