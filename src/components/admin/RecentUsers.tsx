import { Eye, MoreHorizontal } from "lucide-react";
import type { Profile } from "../../routes/index";

interface RecentUsersProps {
  users: Profile[];
  loading?: boolean;
}

function age(dob?: string) {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function statusBadge(user: Profile) {
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

function avatar(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const COLORS = [
  "bg-rose-400",
  "bg-violet-400",
  "bg-sky-400",
  "bg-amber-400",
  "bg-teal-400",
  "bg-pink-400",
];

export default function RecentUsers({ users, loading }: RecentUsersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Recent Users
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Newly registered members
          </p>
        </div>
        <button
          type="button"
          className="text-sm text-rose-500 font-medium hover:underline"
        >
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Loading users…
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Age</th>
                <th className="px-5 py-3">Country</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user, i) => (
                <tr
                  key={user.uuid}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                      >
                        {avatar(user.fullname || "?")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {user.fullname}
                        </p>
                        {user.email && (
                          <p className="text-xs text-gray-400">{user.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{age(user.dob)}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {user.location_country ?? "—"}
                  </td>
                  <td className="px-5 py-3">{statusBadge(user)}</td>
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
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
