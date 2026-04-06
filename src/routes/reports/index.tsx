import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import { supabase } from "../../utils/supabase";
import AdminLayout from "../../components/admin/AdminLayout";

export const Route = createFileRoute("/reports/")({
  component: InterestsPage,
});

interface Interest {
  uuid: string;
  interest: string;
}

export default function InterestsPage() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("interests")
      .select("uuid, interest")
      .order("interest", { ascending: true });
    setInterests(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("interests")
      .insert({ interest: name })
      .select("uuid, interest")
      .single();
    if (!error && data) {
      setInterests((prev) =>
        [...prev, data].sort((a, b) => a.interest.localeCompare(b.interest)),
      );
      setNewName("");
    }
    setAdding(false);
  }

  function startEdit(item: Interest) {
    setEditingId(item.uuid);
    setEditValue(item.interest);
  }

  async function handleSaveEdit(uuid: string) {
    const name = editValue.trim();
    if (!name) return;
    setSaving(true);
    const { error } = await supabase
      .from("interests")
      .update({ interest: name })
      .eq("uuid", uuid);
    if (!error) {
      setInterests((prev) =>
        prev
          .map((i) => (i.uuid === uuid ? { ...i, interest: name } : i))
          .sort((a, b) => a.interest.localeCompare(b.interest)),
      );
    }
    setEditingId(null);
    setSaving(false);
  }

  async function handleDelete(uuid: string) {
    if (
      !confirm(
        "Remove this interest? Users who selected it will be unaffected.",
      )
    )
      return;
    setDeleting(uuid);
    await supabase.from("interests").delete().eq("uuid", uuid);
    setInterests((prev) => prev.filter((i) => i.uuid !== uuid));
    setDeleting(null);
  }

  return (
    <AdminLayout title="Interests">
      <div className="max-w-xl">
        {/* Add new */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="New interest (e.g. Hiking)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-300 shadow-sm placeholder-gray-400"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-semibold text-gray-800">
              All Interests
            </h2>
            <span className="ml-auto text-sm text-gray-400">
              {interests.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Loading…
            </div>
          ) : interests.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No interests yet. Add one above.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {interests.map((item) => (
                <li
                  key={item.uuid}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  {editingId === item.uuid ? (
                    <>
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(item.uuid);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item.uuid)}
                        disabled={saving}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-700">
                        {item.interest}
                      </span>
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => startEdit(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        disabled={deleting === item.uuid}
                        onClick={() => handleDelete(item.uuid)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
