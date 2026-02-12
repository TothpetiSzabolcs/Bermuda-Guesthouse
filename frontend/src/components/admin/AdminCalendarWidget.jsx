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
      return `${base} bg-red-100 text-red-800`; // ✅ PIROS
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

  useEffect(() => {
    load();
  }, []);

  const byDay = useMemo(() => {
    const map = new Map(); // ymd -> booking[]
    for (const b of bookings) {
      for (const day of bookingDays(b)) {
        if (!map.has(day)) map.set(day, []);
        map.get(day).push(b);
      }
    }
    // stabil rendezés a napi listában
    for (const [k, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          String(a.status).localeCompare(String(b.status)) ||
          String(a.code).localeCompare(String(b.code))
      );
      map.set(k, arr);
    }
    return map;
  }, [bookings]);

  // napi “összesítő” a pöttyökhöz (pending/confirmed/paid/cancelled db)
  const daySummary = useMemo(() => {
    const sum = new Map(); // ymd -> {pending, confirmed, paid, cancelled, total}
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

  // kiválasztott nap rövid összegzése (jobb oldali fejlécben)
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
            onClick={load}
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
              const isSelected = key === selectedDay;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  className={[
                    "h-20 rounded-lg border text-left px-2 py-2 hover:bg-gray-50 transition",
                    inMonth ? "bg-white" : "bg-gray-50 text-gray-500",
                    isSelected
                      ? "border-gray-900 ring-1 ring-gray-900"
                      : "border-gray-200",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-medium">{d.getDate()}</div>
                    {count > 0 ? (
                      <span className="text-xs rounded-full bg-gray-900 text-white px-2 py-0.5">
                        {count}
                      </span>
                    ) : null}
                  </div>

                  {/* pöttyök + rövid összegzés */}
                  {count > 0 ? (
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
                      </div>

                      <div className="text-[11px] text-gray-700 leading-tight">
                        {sum?.pending ? `Vár: ${sum.pending} ` : ""}
                        {sum?.confirmed ? `Elf: ${sum.confirmed} ` : ""}
                        {sum?.paid ? `Fiz: ${sum.paid} ` : ""}
                        {sum?.cancelled ? `Tör: ${sum.cancelled}` : ""}
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
                {!selectedSum.total ? (
                  <span className="text-sm text-gray-600">Nincs foglalás</span>
                ) : null}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {selectedList.length ? `${selectedList.length} foglalás` : ""}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {loading ? (
              <p className="text-sm text-gray-600">Betöltés…</p>
            ) : selectedList.length === 0 ? (
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
    </div>
  );
}
