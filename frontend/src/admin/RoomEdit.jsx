import React, { useEffect, useState, useCallback } from "react";
import AdminImageUploader from "../components/AdminImageUploader";

export default function RoomEdit({ slug }) {
  const [room, setRoom] = useState(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    try {
      const r = await fetch(`/api/rooms/${slug}`);
      const json = await r.json();
      if (!r.ok) throw new Error(json?.message || "Failed to load room");
      setRoom(json);
    } catch (e) {
      setErr(e.message);
    }
  }, [slug]);

  useEffect(() => { load(); }, [slug, load]);

  if (!room) return <div className="p-4">{err || "Loading…"}</div>;

  const setCover = async (publicId) => {
    await fetch(`/api/admin/rooms/${slug}/images/cover`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ publicId }),
    });
    load();
  };

  const removeImg = async (publicId) => {
    await fetch(`/api/admin/rooms/${slug}/images/${publicId}`, {
      method: "DELETE",
      credentials: "include",
    });
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{room.name}</h1>

      {/* Images fül */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Images</h2>

        <AdminImageUploader roomSlug={slug} onDone={load} />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(room.images || []).map((img, i) => (
            <div key={img.publicId || i} className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-100">
                <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 flex items-center justify-between text-sm">
                <span className={i === 0 ? "text-amber-700 font-medium" : "text-gray-600"}>
                  {i === 0 ? "Cover" : "Image"}
                </span>
                <div className="flex gap-2">
                  {i !== 0 && (
                    <button
                      onClick={() => setCover(img.publicId)}
                      className="px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
                    >
                      Set cover
                    </button>
                  )}
                  <button
                    onClick={() => removeImg(img.publicId)}
                    className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!room.images || room.images.length === 0) && (
            <div className="text-gray-500">No images yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
