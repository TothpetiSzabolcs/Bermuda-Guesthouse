import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "";

function fmtDateTime(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("hu-HU");
}

function fmtMoney(n, currency = "HUF") {
  if (typeof n !== "number") return "-";
  try {
    return new Intl.NumberFormat("hu-HU").format(n) + ` ${currency}`;
  } catch {
    return `${n} ${currency}`;
  }
}

function asText(v) {
  if (v == null) return "-";
  if (typeof v === "string" || typeof v === "number") return String(v);

  // i18n obj: { hu, en, de }
  if (typeof v === "object") {
    const hu = v.hu ?? v.HU;
    if (typeof hu === "string" && hu.trim()) return hu;

    for (const key of ["en", "de"]) {
      const s = v[key];
      if (typeof s === "string" && s.trim()) return s;
    }

    // fallback: első string érték
    for (const val of Object.values(v)) {
      if (typeof val === "string" && val.trim()) return val;
    }
  }

  return "-";
}

function badgeClass(status) {
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
      return `${base} bg-gray-100 text-gray-700`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
}

export default function AdminBookingDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/bookings/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `DETAIL_FAILED_${res.status}`);
      }
      const data = await res.json();
      setBooking(data);
    } catch (e) {
      setError(e?.message || "Hiba a foglalás betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const actions = useMemo(() => {
    const status = booking?.status;
    const payMethod = booking?.payment?.method; // onsite | transfer
    const isTransfer =
      payMethod === "transfer" || booking?.payment?.transferRequested === true;
    const isOnsite = payMethod === "onsite";

    return {
      canConfirm: status === "pending",
      canCancel: status !== "paid" && ["pending", "confirmed"].includes(status),
      canPayTransfer: status === "confirmed" && isTransfer,
      canPayOnsite: status === "confirmed" && isOnsite,
    };
  }, [booking]);

  const doAction = async (action) => {
    if (!booking?._id) return;
    setError("");

    // confirmok
    if (
      action === "cancel" &&
      !window.confirm("Biztos törlöd ezt a foglalást?")
    )
      return;
    if (
      (action === "pay_transfer" || action === "pay_onsite") &&
      !window.confirm("Biztos fizetettnek jelölöd?")
    )
      return;
    if (
      action === "confirm" &&
      !window.confirm("Biztos elfogadod ezt a foglalást?")
    )
      return;

    setActing(true);
    try {
      let url = `${API}/api/admin/bookings/${booking._id}`;
      let method = "POST";

      if (action === "confirm") url += "/confirm";
      if (action === "cancel") url += "/cancel";
      if (action === "pay_transfer") url += "/pay";
      if (action === "pay_onsite") {
        url += "/paid-onsite";
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `ACTION_FAILED_${res.status}`);
      }

      await load();
    } catch (e) {
      setError(e?.message || "Művelet sikertelen");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Foglalás részletek</h2>
          {booking?.code ? (
            <div className="text-sm text-gray-600">
              Kód: <span className="font-mono">{booking.code}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => nav("/admin/bookings")}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Vissza a listához
          </button>
          <button
            onClick={load}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            disabled={loading || acting}
          >
            Frissítés
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-600">Betöltés…</p>
      ) : !booking ? (
        <p className="text-sm text-gray-600">Nincs adat.</p>
      ) : (
        <>
          {/* Actions */}
          <div className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Státusz:</span>
                <span className={badgeClass(booking.status)}>
                  {booking.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  disabled={!actions.canConfirm || acting}
                  onClick={() => doAction("confirm")}
                >
                  Elfogad
                </button>

                <button
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  disabled={!actions.canCancel || acting}
                  onClick={() => doAction("cancel")}
                >
                  Töröl
                </button>

                <button
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  disabled={!actions.canPayTransfer || acting}
                  onClick={() => doAction("pay_transfer")}
                  title="Csak confirmed + transfer esetén"
                >
                  Fizetett (utalás)
                </button>

                <button
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  disabled={!actions.canPayOnsite || acting}
                  onClick={() => doAction("pay_onsite")}
                  title="Csak confirmed + onsite esetén"
                >
                  Fizetett (helyszínen)
                </button>
              </div>
            </div>

            {acting ? (
              <div className="mt-2 text-xs text-gray-500">Mentés…</div>
            ) : null}
          </div>

          {/* Main info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-white p-4 space-y-2 text-sm">
              <h3 className="font-semibold">Vendég</h3>
              <div>
                <span className="text-gray-600">Név:</span>{" "}
                {booking?.customer?.name || "-"}
              </div>
              <div>
                <span className="text-gray-600">Email:</span>{" "}
                {booking?.customer?.email || "-"}
              </div>
              <div>
                <span className="text-gray-600">Telefon:</span>{" "}
                {booking?.customer?.phone || "-"}
              </div>
              <div>
                <span className="text-gray-600">Megjegyzés:</span>{" "}
                {booking?.customer?.note || "-"}
              </div>
              <div>
                <span className="text-gray-600">Nyelv:</span>{" "}
                {booking?.customer?.lang || "-"}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 space-y-2 text-sm">
              <h3 className="font-semibold">Időpontok</h3>
              <div>
                <span className="text-gray-600">Check-in:</span>{" "}
                {fmtDateTime(booking.checkIn)}
              </div>
              <div>
                <span className="text-gray-600">Check-out:</span>{" "}
                {fmtDateTime(booking.checkOut)}
              </div>
              <div>
                <span className="text-gray-600">Létrehozva:</span>{" "}
                {fmtDateTime(booking.createdAt)}
              </div>
              <div>
                <span className="text-gray-600">Frissítve:</span>{" "}
                {fmtDateTime(booking.updatedAt)}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 space-y-2 text-sm">
              <h3 className="font-semibold">Fizetés</h3>

              <div>
                <span className="text-gray-600">Fizetés módja:</span>{" "}
                {booking?.payment?.method === "onsite"
                  ? "Helyszínen"
                  : booking?.payment?.method === "transfer"
                  ? "Előre utalással"
                  : "-"}
              </div>

              <div>
                <span className="text-gray-600">Fizetés állapota:</span>{" "}
                {booking?.status === "paid" ? (
                  <span className="font-semibold">Fizetve</span>
                ) : (
                  <span className="font-semibold">Nincs fizetve</span>
                )}
              </div>

              <div>
                <span className="text-gray-600">Fizetve ekkor:</span>{" "}
                {fmtDateTime(booking?.payment?.paidAt)}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 space-y-2 text-sm">
              <h3 className="font-semibold">Ár</h3>
              <div>
                <span className="text-gray-600">Éjszakák:</span>{" "}
                {booking?.price?.nights ?? "-"}
              </div>
              <div>
                <span className="text-gray-600">Személyek:</span>{" "}
                {booking?.price?.persons ?? booking?.guestsTotal ?? "-"}
              </div>
              <div>
                <span className="text-gray-600">Alap / fő / éj:</span>{" "}
                {fmtMoney(
                  booking?.price?.basePerPersonPerNight,
                  booking?.price?.currency
                )}
              </div>
              <div>
                <span className="text-gray-600">Összesen:</span>{" "}
                <span className="font-semibold">
                  {fmtMoney(booking?.price?.total, booking?.price?.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Items + Admin actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-white p-4 space-y-2 text-sm">
              <h3 className="font-semibold">Lefoglalt szobák</h3>

              {(booking?.items || []).length === 0 ? (
                <div className="text-gray-600">Nincs megadva szoba.</div>
              ) : (
                <ul className="space-y-2">
                  {booking.items.map((it, idx) => {
                    const roomObj =
                      it?.room && typeof it.room === "object" ? it.room : null;
                      const roomName = roomObj ? asText(roomObj?.name) : "Ismeretlen szoba";
                    const guests = it?.guests ?? "-";

                    return (
                      <li key={idx} className="rounded-lg border p-3">
                        <div>
                          <span className="text-gray-600">Szoba:</span>{" "}
                          <span className="font-medium">{roomName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Vendégek száma ebben a szobában:
                          </span>{" "}
                          {guests}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-xl border bg-white p-4 space-y-2 text-sm">
              <h3 className="font-semibold">Kezelések időpontjai</h3>
              <div>
                <span className="text-gray-600">Elfogadva ekkor:</span>{" "}
                {fmtDateTime(booking?.adminAction?.confirmAt)}
              </div>
              <div>
                <span className="text-gray-600">Lemondva ekkor:</span>{" "}
                {fmtDateTime(booking?.adminAction?.cancelAt)}
              </div>
              <div>
                <span className="text-gray-600">
                  Fizetettnek jelölve ekkor:
                </span>{" "}
                {fmtDateTime(booking?.adminAction?.paidAt)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
