import { useEffect, useMemo, useState } from "react";
import { cld } from "../../utils/cloudinary.js"; // ha máshol van, igazítsd az importot

const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;

const CATS = [
  { value: "to", label: "Tó" },
  { value: "udvar", label: "Udvar" },
  { value: "csarda", label: "Csárda" },
  { value: "wellness", label: "Wellness" },
  { value: "programok", label: "Programok" },
  { value: "egyeb", label: "Egyéb" },
  { value: "konyha", label: "Konyha" },
  { value: "etkezo", label: "Étkező" },
  { value: "nappali", label: "Nappali" },
  { value: "nagyterem", label: "Nagyterem" },
  { value: "kavezo-teazo", label: "Kávézó/Teázó" },
  { value: "terasz", label: "Terasz" },
];


const TYPE_OPTS = [
  { value: "all", label: "Összes" },
  { value: "image", label: "Képek" },
  { value: "video", label: "Videók" },
];

const PAGE_LIMIT = 24;
const PROPERTY_SLUG = "bermuda-vendeghaz";

export default function AdminGallery() {
  // lista állapot
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setL] = useState(true);
  const [error, setErr] = useState(null);

  // szűrők, lapozás
  const [catFilter, setCatFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  // feltöltés
  const [file, setFile] = useState(null);
  const [category, setCat] = useState("konyha");
  const [altHu, setAltHu] = useState("");
  const [altEn, setAltEn] = useState("");
  const [altDe, setAltDe] = useState("");
  const [busy, setBusy] = useState(false);

  // admin lista betöltése (admin endpoint!)
  const load = async () => {
    setL(true);
    setErr(null);
    try {
      const url = new URL("/api/admin/gallery", API_BASE);
      url.searchParams.set("propertySlug", PROPERTY_SLUG);
      if (catFilter !== "all") url.searchParams.set("category", catFilter);
      if (typeFilter !== "all") url.searchParams.set("resourceType", typeFilter);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(PAGE_LIMIT));

      const r = await fetch(url.toString(), { credentials: "include" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      setItems(json.items ?? []);
      setTotal(json.total ?? 0);
    } catch (e) {
      setErr(e);
    } finally {
      setL(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catFilter, typeFilter, page]);

  // thumb url (képhez optimalizált), videónál poszter / első frame
  const getThumb = (doc) => {
    if (!doc) return null;
    if (doc.resourceType === "video") {
      const raw = doc.posterUrl || doc.url.replace("/upload/", "/upload/so_1,f_jpg/");
      return cld(raw, "f_auto,q_auto,c_fill,g_center,w_400,h_240");
    }
    return cld(doc.url, "f_auto,q_auto,c_fill,g_center,w_400,h_240");
  };



  // feltöltés (kép+videó)
  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("propertySlug", PROPERTY_SLUG);
      form.append("category", category);
      form.append("altHu", altHu);
      form.append("altEn", altEn);
      form.append("altDe", altDe);

      const r = await fetch(`${API_BASE}/api/admin/gallery`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        throw new Error(`Upload failed: ${r.status} ${txt}`);
      }
      // clean
      setFile(null); setAltHu(""); setAltEn(""); setAltDe("");
      // vissza első oldalra, hogy biztosan lásd az újat felül
      setPage(1);
      await load();
    } catch (err) {
      console.error(err);
      alert("Feltöltési hiba.");
    } finally {
      setBusy(false);
    }
  };

  // törlés
  const remove = async (id) => {
    if (!confirm("Biztos törlöd?")) return;
    await fetch(`${API_BASE}/api/admin/gallery/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await load();
  };

  // borító beállítása
  const setAsCover = async (id) => {
    await fetch(`${API_BASE}/api/admin/gallery/${id}/cover`, {
      method: "POST",
      credentials: "include",
    });
    // frissítjük a listát (kategórián belül csak az legyen cover)
    await load();
  };

  // kliens oldali, laza kereső alt/format/publicId alapján
  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const qq = q.toLowerCase();
    return items.filter((x) => {
      const hay = [
        x.publicId,
        x.format,
        x.alt?.hu, x.alt?.en, x.alt?.de,
        x.category,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(qq);
    });
  }, [items, q]);

  const pages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Galéria kezelése</h2>

      {/* Feltöltő */}
      <form onSubmit={upload} className="grid md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Kategória</label>
            <select
              value={category}
              onChange={(e) => setCat(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              {CATS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Fájl (kép vagy videó)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full"
              required
            />
            {file && (
              <p className="mt-1 text-xs text-gray-500">
                {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}
          </div>

          <button
            disabled={busy}
            className="rounded bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
          >
            {busy ? "Feltöltés…" : "Feltöltés"}
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Alt (HU)</label>
            <input
              value={altHu}
              onChange={(e) => setAltHu(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Alt (EN)</label>
            <input
              value={altEn}
              onChange={(e) => setAltEn(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Alt (DE)</label>
            <input
              value={altDe}
              onChange={(e) => setAltDe(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
        </div>
      </form>

      {/* Szűrők + Kereső */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Kategória:</span>
          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="all">Összes</option>
            {CATS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Típus:</span>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded border px-3 py-2 text-sm"
          >
            {TYPE_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Keresés (alt/publicId/format)"
            className="rounded border px-3 py-2 text-sm w-64"
          />
          <button
            onClick={() => { setQ(""); }}
            className="rounded border px-3 py-2 text-sm"
            type="button"
          >
            Törlés
          </button>
        </div>
      </div>

      {/* Lista / hiba / állapot */}
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">Hiba történt.</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600">Nincs találat.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((doc) => {
              const thumb = getThumb(doc);
              const isVideo = doc.resourceType === "video";
              return (
                <div key={doc._id} className="bg-white rounded-xl overflow-hidden border">
                  <div className="relative">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={doc.alt?.hu || doc.publicId}
                        className="h-40 w-full object-center"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-40 w-full bg-gray-200" />
                    )}
                    {isVideo && (
                      <span className="absolute top-2 left-2 rounded bg-black/70 text-white text-xs px-2 py-1">
                        VIDEO
                      </span>
                    )}
                    {doc.isCover && (
                      <span className="absolute top-2 right-2 rounded bg-emerald-600 text-white text-xs px-2 py-1">
                        Cover
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">{doc.category}</span>
                      <span className="text-gray-400">{doc.format?.toUpperCase()}</span>
                    </div>
                    <div className="text-gray-500 truncate">{doc.publicId}</div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {!doc.isCover && (
                        <button
                          onClick={() => setAsCover(doc._id)}
                          className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Beállítás borítónak
                        </button>
                      )}
                      <button
                        onClick={() => remove(doc._id)}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Törlés
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lapozó */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Előző
              </button>
              <span className="text-sm text-gray-600">
                {page} / {pages} &nbsp;—&nbsp; összesen {total}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Következő
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
