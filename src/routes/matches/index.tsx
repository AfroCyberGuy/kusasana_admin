import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Trash2, Users } from "lucide-react";
import { supabase } from "../../utils/supabase";
import AdminLayout from "../../components/admin/AdminLayout";

export const Route = createFileRoute("/matches/")({
  component: RoomsPage,
});

interface Room {
  id: string;
  creater_id: string;
  room_id: string;
  group_name: string;
  created_at: string;
  creater_name?: string;
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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filtered, setFiltered] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("rooms")
      .select("id, creater_id, room_id, group_name, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!data) {
      setLoading(false);
      return;
    }

    // Fetch creator names from profiles
    const createrIds = [
      ...new Set(data.map((r: any) => r.creater_id).filter(Boolean)),
    ];
    let nameMap: Record<string, string> = {};
    if (createrIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("uuid, fullname")
        .in("uuid", createrIds);
      for (const p of profiles ?? []) {
        nameMap[p.uuid] = p.fullname;
      }
    }

    const result: Room[] = data.map((r: any) => ({
      id: r.id,
      creater_id: r.creater_id,
      room_id: r.room_id,
      group_name: r.group_name,
      created_at: r.created_at,
      creater_name: nameMap[r.creater_id] ?? undefined,
    }));

    setRooms(result);
    setFiltered(result);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(rooms);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      rooms.filter(
        (r) =>
          (r.group_name ?? "").toLowerCase().includes(q) ||
          (r.creater_name ?? "").toLowerCase().includes(q) ||
          (r.room_id ?? "").toLowerCase().includes(q),
      ),
    );
  }, [search, rooms]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    setDeleting(id);
    await supabase.from("rooms").delete().eq("id", id);
    setDeleting(null);
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <AdminLayout title="Rooms">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-sm shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by group name, creator or room ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
          />
        </div>
        <p className="ml-auto text-sm text-gray-400">
          {filtered.length} room{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-rose-500" />
          <h2 className="text-base font-semibold text-gray-800">All Rooms</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Loading rooms…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Group Name</th>
                  <th className="px-5 py-3">Creator</th>
                  <th className="px-5 py-3">Room ID</th>
                  <th className="px-5 py-3">Date Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((room, i) => (
                  <tr
                    key={room.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                        >
                          {avatar(room.group_name ?? "")}
                        </div>
                        <span className="font-medium text-gray-800">
                          {room.group_name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {room.creater_name ?? (
                        <span className="font-mono text-xs text-gray-400">
                          {(room.creater_id ?? "—").slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">
                      {room.room_id || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(room.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        title="Delete room"
                        disabled={deleting === room.id}
                        onClick={() => handleDelete(room.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      No rooms found
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
