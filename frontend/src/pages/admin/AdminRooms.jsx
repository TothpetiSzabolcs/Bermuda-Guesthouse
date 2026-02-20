import { useEffect, useState } from "react";
import { isPromoActive } from "../../utils/price";
import { validatePromo } from "../../utils/priceAdmin";

const API = import.meta.env.VITE_API_URL || "";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setL] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null); // room id being toggled

  const reload = async () => {
    try {
      const url = new URL("/api/rooms", API || window.location.origin);
      url.searchParams.set("propertySlug", "bermuda-vendeghaz");
      url.searchParams.set("active", "all");
      const r = await fetch(url);
      setRooms(await r.json());
    } catch { /* ignore */ }
  };

  const toggleActive = async (room) => {
    const id = room.id || room._id;
    const newActive = !room.active;
    if (
      !newActive &&
      !window.confirm(
        `Biztosan szünetelteted a "${room.name}" szobát?\n\nA szüneteltetett szobák nem jelennek meg a weboldalon és nem foglalhatók.`
      )
    )
      return;

    setToggling(id);
    try {
      const res = await fetch(`${API}/api/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      await reload();
    } catch {
      alert("Hiba történt a szoba állapotának módosításakor.");
    } finally {
      setToggling(null);
    }
  };

  useEffect(() => {
    (async () => {
      setL(true);
      try {
        const url = new URL("/api/rooms", API || window.location.origin);
        url.searchParams.set("propertySlug", "bermuda-vendeghaz");
        url.searchParams.set("active", "all");
        const r = await fetch(url);
        setRooms(await r.json());
      } finally {
        setL(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Szobák</h2>
        <p className="text-sm text-gray-500 mt-1">
          Árak és akciók kezelése
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Betöltés…
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((r) => {
            const error = validatePromo(r.price);
            const hasPromo = isPromoActive(r.price?.promo);
            const coverImg = r.images?.[0]?.url || r.image;

            return (
              <div
                key={r.id || r._id}
                className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${
                  r.active ? "border-gray-200" : "border-gray-300 opacity-60"
                }`}
              >
                {/* Szoba kép */}
                <div className="relative h-40 bg-gray-100">
                  {coverImg ? (
                    <img
                      src={coverImg}
                      alt={r.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  )}

                  {/* Státusz badge-ek a képen */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${
                        r.active
                          ? "bg-green-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}
                    >
                      {r.active ? "Aktív" : "Szüneteltetve"}
                    </span>

                    {hasPromo && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/90 text-white backdrop-blur-sm">
                        AKCIÓ
                      </span>
                    )}
                  </div>
                </div>

                {/* Tartalom */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {r.name}
                  </h3>

                  {/* Info sor */}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {r.guests ?? r.capacity} fő
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                      </svg>
                      {r.price?.unit === "room_night" ? "szoba / éj" : "fő / éj"}
                    </span>
                  </div>

                  {/* Ár szekció */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    {hasPromo ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-green-600">
                          {r.price.promo.amount?.toLocaleString("hu-HU")} Ft
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {r.price?.amount?.toLocaleString("hu-HU")} Ft
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {r.price?.amount?.toLocaleString("hu-HU") ?? "—"} Ft
                      </span>
                    )}

                    {hasPromo && r.price?.promo?.endAt && (
                      <div className="text-xs text-red-500 mt-1">
                        Akció vége:{" "}
                        {new Date(r.price.promo.endAt).toLocaleDateString("hu-HU")}
                      </div>
                    )}
                  </div>

                  {/* Hiba jelzés */}
                  {error && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg flex items-start gap-1.5">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Gombok */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(r);
                        setForm(
                          r.price ?? {
                            amount: 9000,
                            currency: "HUF",
                            unit: "person_night",
                            promo: { enabled: false },
                          },
                        );
                      }}
                      className="flex-1 text-sm font-medium bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Ár / Akció
                    </button>

                    <button
                      onClick={() => toggleActive(r)}
                      disabled={toggling === (r.id || r._id)}
                      className={`text-sm font-medium px-4 py-2.5 rounded-lg border transition-colors disabled:opacity-50 ${
                        r.active
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                      title={r.active ? "Szoba szüneteltetése" : "Szoba aktiválása"}
                    >
                      {toggling === (r.id || r._id)
                        ? "…"
                        : r.active
                        ? "Szüneteltetés"
                        : "Aktiválás"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Szerkesztő modal – változatlan logika, szebb stílus */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Modal fejléc */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing.name}
              </h3>
              <p className="text-sm text-gray-500">Ár és akció beállítása</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Alapár */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Alapár (Ft)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: Number(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Egység */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Egység
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                >
                  <option value="person_night">fő / éj</option>
                  <option value="room_night">szoba / éj</option>
                </select>
              </div>

              {/* Akció toggle */}
              <div className="pt-2 border-t">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.promo?.enabled}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          promo: { ...form.promo, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Akció aktív
                  </span>
                </label>
              </div>

              {/* Akció mezők */}
              {form.promo?.enabled && (
                <div className="space-y-3 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Akciós ár (Ft)
                    </label>
                    <input
                      type="number"
                      placeholder="Akciós ár"
                      value={form.promo.amount ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          promo: {
                            ...form.promo,
                            amount: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Kezdete
                      </label>
                      <input
                        type="date"
                        value={form.promo.startAt?.slice(0, 10) || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            promo: { ...form.promo, startAt: e.target.value },
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Vége
                      </label>
                      <input
                        type="date"
                        value={form.promo.endAt?.slice(0, 10) || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            promo: { ...form.promo, endAt: e.target.value },
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal lábléc */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Mégse
              </button>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await fetch(`${API}/api/rooms/${editing.id || editing._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ price: form }),
                  });
                  setSaving(false);
                  setEditing(null);
                  await reload();
                }}
                className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? "Mentés…" : "Mentés"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}