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
      <h2 className="text-lg font-semibold mb-4">Szobák</h2>
      {loading ? (
        "Loading…"
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => {
            const error = validatePromo(r.price);

            return (
              <div
                key={r.id || r._id}
                className="bg-white p-4 rounded-xl border"
              >
                <div className="font-medium">
                  {r.name}

                  {isPromoActive(r.price?.promo) && (
                    <span className="text-[10px] bg-red-600 text-white px-4 py-0.5 rounded-full ml-2">
                      AKCIÓ
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-700 my-1">
                  Ár: <strong>{r.price?.amount ?? "—"} Ft</strong>
                </div>

                {r.price?.promo?.enabled && (
                  <div className="text-sm text-green-700">
                    Akciós ár: <strong>{r.price.promo.amount} Ft</strong>
                  </div>
                )}

                {error && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    ⚠️ {error}
                  </div>
                )}

                {isPromoActive(r.price?.promo) && (
                  <div className="text-xs text-red-600 my-1">
                    Akció vége:{" "}
                    {new Date(r.price.promo.endAt).toLocaleDateString("hu-HU")}
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  Kapacitás: {r.guests ?? r.capacity}
                </div>

                <div className="text-sm text-gray-600">
                  Aktív: {String(r.active)}
                </div>

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
                  className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded"
                >
                  Ár beállítása / Akció
                </button>
              </div>
            );
          })}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editing.name} – Ár</h3>

            {/* alapár */}
            <label className="block text-sm mb-1">Alapár (Ft)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <label className="block text-sm mb-1">Egység</label>
            <select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="person_night">fő / éj</option>
              <option value="room_night">szoba / éj</option>
            </select>

            {/* akció */}
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={form.promo?.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    promo: { ...form.promo, enabled: e.target.checked },
                  })
                }
              />
              Akció aktív
            </label>

            {form.promo?.enabled && (
              <>
                <input
                  type="number"
                  placeholder="Akciós ár"
                  value={form.promo.amount ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      promo: { ...form.promo, amount: Number(e.target.value) },
                    })
                  }
                  className="w-full border rounded px-3 py-2 mb-2"
                />

                <input
                  type="date"
                  value={form.promo.startAt?.slice(0, 10) || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      promo: { ...form.promo, startAt: e.target.value },
                    })
                  }
                  className="w-full border rounded px-3 py-2 mb-2"
                />

                <input
                  type="date"
                  value={form.promo.endAt?.slice(0, 10) || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      promo: { ...form.promo, endAt: e.target.value },
                    })
                  }
                  className="w-full border rounded px-3 py-2 mb-3"
                />
              </>
            )}

            {/* actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm"
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
                  location.reload();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
