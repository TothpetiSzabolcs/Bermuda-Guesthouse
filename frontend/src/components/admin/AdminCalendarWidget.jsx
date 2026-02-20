import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "";

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function startOfCalendarGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const day = (first.getDay() + 6) % 7; // hétfő=0
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - day);
  gridStart.setHours(0, 0, 0, 0);
  return gridStart;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function ymd(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}
function fmtMonthHu(d) {
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "long" });
}
function fmtDateHu(d) {
  return new Date(d).toLocaleDateString("hu-HU");
}

function paymentMethodHu(b) {
  const m = b?.payment?.method;
  if (m === "onsite") return "Helyszínen";
  if (m === "transfer") return "Előreutalás";
  return "—";
}
function statusHu(s) {
  if (s === "pending") return "Várakozik";
  if (s === "confirmed") return "Elfogadva";
  if (s === "paid") return "Fizetve";
  if (s === "cancelled") return "Törölve";
  return s || "—";
}

function getRoomName(room) {
  if (!room) return "Szoba";
  if (typeof room === "object") {
    const n = room.name;
    if (!n) return "Szoba";
    if (typeof n === "string") return n;
    return n.hu || n.en || n.de || "Szoba";
  }

  if (typeof room === "string") return "Szoba";
  return "Szoba";
}

function roomsSummary(b) {
  const items = Array.isArray(b?.items) ? b.items : [];
  if (!items.length) return "—";

  return items
    .map((i) => {
      const nm = getRoomName(i?.room);
      const g = Number(i?.guests);
      return Number.isFinite(g) ? `${nm} (${g} fő)` : nm;
    })
    .join(", ");
}

function statusBadgeClass(status) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  switch (status) {
    case "pending":
      return `${base} bg-yellow-100 text-yellow-800`;
    case "confirmed":
      return `${base} bg-blue-100 text-blue-800`;
    case "paid":
      return `${base} bg-green-100 text-green-800`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
}

function dotClass(status) {
  const base = "inline-block h-2 w-2 rounded-full";
  switch (status) {
    case "pending":
      return `${base} bg-yellow-500`;
    case "confirmed":
      return `${base} bg-blue-500`;
    case "paid":
      return `${base} bg-green-500`;
    case "cancelled":
      return `${base} bg-red-500`;
    case "blocked":
      return `${base} bg-purple-500`;
    default:
      return `${base} bg-gray-400`;
  }
}

function bookingDays(b) {
  const ci = new Date(b.checkIn);
  const co = new Date(b.checkOut);
  ci.setHours(0, 0, 0, 0);
  co.setHours(0, 0, 0, 0);

  const days = [];
  if (!Number.isFinite(ci.getTime()) || !Number.isFinite(co.getTime()))
    return days;

  let cur = new Date(ci);
  while (cur < co) {
    days.push(ymd(cur));
    cur = addDays(cur, 1);
  }
  return days;
}

export default function AdminCalendarWidget() {
  const nav = useNavigate();

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [selectedDay, setSelectedDay] = useState(() => ymd(new Date()));

  // ── Blocked dates state ──────────────────────────────────
  const [rooms, setRooms] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]); // [{date, note, room:{_id,name}}]
  const [blockRoom, setBlockRoom] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockNote, setBlockNote] = useState("");
  const [blockBusy, setBlockBusy] = useState(false);
  const [showBlockPanel, setShowBlockPanel] = useState(false);

  // ── Load bookings ────────────────────────────────────────
  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/bookings?limit=500`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`LIST_FAILED_${res.status}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Hiba a foglalások betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  // ── Load rooms for dropdown ──────────────────────────────
  const loadRooms = async () => {
    try {
      const res = await fetch(`${API}/api/rooms?propertySlug=bermuda-vendeghaz&active=all`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.rooms || [];
      setRooms(list);
      if (list.length && !blockRoom) setBlockRoom(list[0].id || list[0]._id);
    } catch {}
  };

  // ── Load blocked dates ───────────────────────────────────
  const loadBlocked = async () => {
    try {
      // Fetch all blocked dates (no room filter – we want all for calendar display)
      const res = await fetch(`${API}/api/admin/blocked-dates`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setBlockedDates(Array.isArray(data) ? data : []);
    } catch {}
  };

  // ── Block dates ──────────────────────────────────────────
  const handleBlock = async () => {
    if (!blockRoom || !blockStart || !blockEnd) return;
    setBlockBusy(true);
    try {
      const res = await fetch(`${API}/api/admin/blocked-dates`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: blockRoom, startDate: blockStart, endDate: blockEnd, note: blockNote }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Block failed");
      }
      setBlockNote("");
      await loadBlocked();
    } catch (e) {
      alert("Hiba a blokkoláskor: " + (e?.message || ""));
    } finally {
      setBlockBusy(false);
    }
  };

  // ── Unblock dates ────────────────────────────────────────
  const handleUnblock = async () => {
    if (!blockRoom || !blockStart || !blockEnd) return;
    if (!confirm("Biztosan feloldod a blokkolást erre az időszakra?")) return;
    setBlockBusy(true);
    try {
      const res = await fetch(`${API}/api/admin/blocked-dates`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: blockRoom, startDate: blockStart, endDate: blockEnd }),
      });
      if (!res.ok) throw new Error("Unblock failed");
      await loadBlocked();
    } catch (e) {
      alert("Hiba a feloldáskor: " + (e?.message || ""));
    } finally {
      setBlockBusy(false);
    }
  };

  useEffect(() => {
    load();
    loadRooms();
    loadBlocked();
  }, []);

  // ── Blocked dates by day (ymd → [{note, roomName}]) ─────
  const blockedByDay = useMemo(() => {
    const map = new Map();
    for (const bd of blockedDates) {
      const d = new Date(bd.date);
      d.setHours(0, 0, 0, 0);
      const key = ymd(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({
        note: bd.note || "",
        roomName: getRoomName(bd.room),
        roomId: bd.room?._id || bd.room,
      });
    }
    return map;
  }, [blockedDates]);

  // ── Bookings by day ──────────────────────────────────────
  const byDay = useMemo(() => {
    const map = new Map();
    for (const b of bookings) {
      for (const day of bookingDays(b)) {
        if (!map.has(day)) map.set(day, []);
        map.get(day).push(b);
      }
    }
    for (const [, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          String(a.status).localeCompare(String(b.status)) ||
          String(a.code).localeCompare(String(b.code))
      );
    }
    return map;
  }, [bookings]);

  const daySummary = useMemo(() => {
    const sum = new Map();
    for (const [day, arr] of byDay.entries()) {
      const s = {
        pending: 0,
        confirmed: 0,
        paid: 0,
        cancelled: 0,
        total: arr.length,
      };
      for (const b of arr) {
        const st = b?.status;
        if (st === "pending") s.pending++;
        else if (st === "confirmed") s.confirmed++;
        else if (st === "paid") s.paid++;
        else if (st === "cancelled") s.cancelled++;
      }
      sum.set(day, s);
    }
    return sum;
  }, [byDay]);

  const gridStart = useMemo(() => startOfCalendarGrid(month), [month]);
  const days = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
    [gridStart]
  );

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  const selectedList = byDay.get(selectedDay) || [];
  const selectedBlocked = blockedByDay.get(selectedDay) || [];

  const selectedSum = daySummary.get(selectedDay) || {
    pending: 0,
    confirmed: 0,
    paid: 0,
    cancelled: 0,
    total: 0,
  };

  return (
    <div className="rounded-xl border bg-white p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Foglalási naptár</h3>
          <p className="text-sm text-gray-600">
            Kattints egy napra, és jobb oldalt látod az aznapi foglalásokat.
          </p>

          {/* jelmagyarázat */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-700">
            <span className="inline-flex items-center gap-2">
              <span className={dotClass("pending")} /> Várakozik
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={dotClass("confirmed")} /> Elfogadva
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={dotClass("paid")} /> Fizetve
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={dotClass("cancelled")} /> Törölve
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={dotClass("blocked")} /> Blokkolt
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() =>
              setMonth((m) =>
                startOfMonth(new Date(m.getFullYear(), m.getMonth() - 1, 1))
              )
            }
          >
            ◀
          </button>

          <div className="min-w-[180px] text-center font-medium">
            {fmtMonthHu(month)}
          </div>

          <button
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() =>
              setMonth((m) =>
                startOfMonth(new Date(m.getFullYear(), m.getMonth() + 1, 1))
              )
            }
          >
            ▶
          </button>

          <button
            className="ml-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={() => { load(); loadBlocked(); }}
            disabled={loading}
          >
            Frissítés
          </button>
        </div>
      </div>

      {err ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Naptár */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-7 text-xs text-gray-600 mb-2">
            {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((d) => (
              <div key={d} className="py-2 px-2 font-semibold">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const key = ymd(d);
              const inMonth = d >= monthStart && d <= monthEnd;
              const sum = daySummary.get(key);
              const count = sum?.total || 0;
              const blocked = blockedByDay.get(key);
              const hasBlocked = blocked && blocked.length > 0;
              const isSelected = key === selectedDay;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  className={[
                    "h-20 rounded-lg border text-left px-2 py-2 hover:bg-gray-50 transition relative",
                    inMonth ? "bg-white" : "bg-gray-50 text-gray-500",
                    isSelected
                      ? "border-gray-900 ring-1 ring-gray-900"
                      : hasBlocked && !count
                      ? "border-purple-300 bg-purple-50"
                      : "border-gray-200",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-medium">{d.getDate()}</div>
                    <div className="flex items-center gap-1">
                      {hasBlocked ? (
                        <span className="text-xs rounded-full bg-purple-600 text-white px-1.5 py-0.5" title="Blokkolt">
                          🔒
                        </span>
                      ) : null}
                      {count > 0 ? (
                        <span className="text-xs rounded-full bg-gray-900 text-white px-2 py-0.5">
                          {count}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* pöttyök + rövid összegzés */}
                  {count > 0 || hasBlocked ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {sum?.pending ? (
                          <span className={dotClass("pending")} />
                        ) : null}
                        {sum?.confirmed ? (
                          <span className={dotClass("confirmed")} />
                        ) : null}
                        {sum?.paid ? (
                          <span className={dotClass("paid")} />
                        ) : null}
                        {sum?.cancelled ? (
                          <span className={dotClass("cancelled")} />
                        ) : null}
                        {hasBlocked ? (
                          <span className={dotClass("blocked")} />
                        ) : null}
                      </div>

                      <div className="text-[11px] text-gray-700 leading-tight">
                        {sum?.pending ? `Vár: ${sum.pending} ` : ""}
                        {sum?.confirmed ? `Elf: ${sum.confirmed} ` : ""}
                        {sum?.paid ? `Fiz: ${sum.paid} ` : ""}
                        {sum?.cancelled ? `Tör: ${sum.cancelled} ` : ""}
                        {hasBlocked ? `🔒${blocked.length}` : ""}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-400">—</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Napi lista */}
        <div className="lg:col-span-4 rounded-xl border border-gray-200 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-gray-600">Kiválasztott nap</div>
              <div className="text-lg font-semibold">
                {fmtDateHu(selectedDay)}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSum.pending ? (
                  <span className={statusBadgeClass("pending")}>
                    Várakozik: {selectedSum.pending}
                  </span>
                ) : null}
                {selectedSum.confirmed ? (
                  <span className={statusBadgeClass("confirmed")}>
                    Elfogadva: {selectedSum.confirmed}
                  </span>
                ) : null}
                {selectedSum.paid ? (
                  <span className={statusBadgeClass("paid")}>
                    Fizetve: {selectedSum.paid}
                  </span>
                ) : null}
                {selectedSum.cancelled ? (
                  <span className={statusBadgeClass("cancelled")}>
                    Törölve: {selectedSum.cancelled}
                  </span>
                ) : null}
                {selectedBlocked.length > 0 ? (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
                    🔒 Blokkolt: {selectedBlocked.length}
                  </span>
                ) : null}
                {!selectedSum.total && !selectedBlocked.length ? (
                  <span className="text-sm text-gray-600">Nincs foglalás</span>
                ) : null}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {selectedList.length ? `${selectedList.length} foglalás` : ""}
            </div>
          </div>

          {/* Blokkolt napok a kiválasztott napon */}
          {selectedBlocked.length > 0 ? (
            <div className="mt-3 space-y-2">
              {selectedBlocked.map((bd, i) => (
                <div
                  key={`blocked-${i}`}
                  className="rounded-lg border border-purple-200 bg-purple-50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-purple-800">
                        🔒 Blokkolt – {bd.roomName}
                      </div>
                      {bd.note ? (
                        <div className="text-xs text-purple-700 mt-1">{bd.note}</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Foglalások */}
          <div className="mt-3 space-y-2">
            {loading ? (
              <p className="text-sm text-gray-600">Betöltés…</p>
            ) : selectedList.length === 0 && selectedBlocked.length === 0 ? (
              <p className="text-sm text-gray-600">
                Erre a napra nincs foglalás.
              </p>
            ) : (
              selectedList.map((b) => (
                <div
                  key={b._id}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">
                        {b?.customer?.name || "Vendég"}{" "}
                        <span className="font-mono text-xs text-gray-600">
                          ({b?.code})
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {fmtDateHu(b.checkIn)} – {fmtDateHu(b.checkOut)}
                      </div>
                    </div>

                    <span className={statusBadgeClass(b.status)}>
                      {statusHu(b.status)}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-700 space-y-1">
                    <div>
                      <span className="text-gray-500">Szoba(k):</span>{" "}
                      {roomsSummary(b)}
                    </div>
                    <div>
                      <span className="text-gray-500">Fizetés:</span>{" "}
                      {paymentMethodHu(b)}
                    </div>
                    <div>
                      <span className="text-gray-500">Vendégek összesen:</span>{" "}
                      {b?.guestsTotal ?? "—"} fő
                    </div>
                  </div>

                  <div className="mt-2">
                    <button
                      className="text-xs underline underline-offset-2 hover:opacity-80"
                      onClick={() => nav(`/admin/bookings/${b._id}`)}
                    >
                      Részletek megnyitása
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            A foglalás több naphoz is hozzászámolódik (ott-tartózkodás napjai).
          </div>
        </div>
      </div>

      {/* ── Dátum blokkolás panel ───────────────────────────── */}
      <div className="rounded-xl border border-gray-200">
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
          onClick={() => setShowBlockPanel((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <span className="font-semibold text-sm">Dátum blokkolás</span>
            <span className="text-xs text-gray-500">
              (napok manuális lezárása foglalás nélkül)
            </span>
          </div>
          <span className="text-gray-400 text-sm">
            {showBlockPanel ? "▲" : "▼"}
          </span>
        </button>

        {showBlockPanel ? (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              Válaszd ki a szobát, dátumtartományt és adj hozzá megjegyzést.
              A blokkolt napok a nyilvános naptárban is foglaltként jelennek meg.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Szoba */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Szoba
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={blockRoom}
                  onChange={(e) => setBlockRoom(e.target.value)}
                >
                  {rooms.map((r) => {
                    const rid = r.id || r._id;
                    const label = typeof r.name === "string" ? r.name : r.name?.hu || r.name?.en || r.name?.de || "Szoba";
                    return (
                      <option key={rid} value={rid}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dátumtól */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dátumtól
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                />
              </div>

              {/* Dátumig */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dátumig
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                />
              </div>

              {/* Megjegyzés */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Megjegyzés
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="pl. Ház vendégei"
                  value={blockNote}
                  onChange={(e) => setBlockNote(e.target.value)}
                />
              </div>

              {/* Gombok */}
              <div className="flex items-end gap-2">
                <button
                  className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                  onClick={handleBlock}
                  disabled={blockBusy || !blockRoom || !blockStart || !blockEnd}
                >
                  {blockBusy ? "…" : "Blokkol"}
                </button>
                <button
                  className="rounded-lg border border-red-300 text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                  onClick={handleUnblock}
                  disabled={blockBusy || !blockRoom || !blockStart || !blockEnd}
                >
                  {blockBusy ? "…" : "Felold"}
                </button>
              </div>
            </div>

            {/* Aktív blokkolások listája az adott szobára */}
            {blockedDates.filter((bd) => {
              const rid = bd.room?._id || bd.room;
              return String(rid) === String(blockRoom);
            }).length > 0 ? (
              <div className="mt-2">
                <div className="text-xs font-medium text-gray-700 mb-2">
                  Aktív blokkolások ({(() => {
                    const r = rooms.find((r) => (r.id || r._id) === blockRoom);
                    if (!r) return "Szoba";
                    return typeof r.name === "string" ? r.name : r.name?.hu || r.name?.en || "Szoba";
                  })()}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {blockedDates
                    .filter((bd) => {
                      const rid = bd.room?._id || bd.room;
                      return String(rid) === String(blockRoom);
                    })
                    .map((bd) => (
                      <span
                        key={bd._id}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-xs"
                      >
                        {ymd(new Date(bd.date))}
                        {bd.note ? ` – ${bd.note}` : ""}
                      </span>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}