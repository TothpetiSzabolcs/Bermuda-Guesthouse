import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL || "";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setL] = useState(true);

  useEffect(() => {
    (async () => {
      setL(true);
      try {
        const url = new URL("/api/rooms", API || window.location.origin);
        url.searchParams.set("propertySlug", "bermuda-vendeghaz");
        url.searchParams.set("active", "all");
        const r = await fetch(url);
        setRooms(await r.json());
      } finally { setL(false); }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Szobák</h2>
      {loading ? "Loading…" : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <div key={r.id || r._id} className="bg-white p-4 rounded-xl border">
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-gray-600">Kapacitás: {r.guests ?? r.capacity}</div>
              <div className="text-sm text-gray-600">Aktív: {String(r.active)}</div>
              {/* Később: szerkesztés modal, képek kezelése stb. */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
