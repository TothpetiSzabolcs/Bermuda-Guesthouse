import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("hu-HU");
}

function statusLabel(status) {
  switch (status) {
    case "pending":
      return "Várakozik";
    case "confirmed":
      return "Elfogadva";
    case "paid":
      return "Fizetve";
    case "cancelled":
      return "Lemondva";
    default:
      return "Ismeretlen";
  }
}

function paymentLabel(payment) {
  const method = payment?.method;
  const isTransfer = method === "transfer" || payment?.transferRequested === true;
  const isOnsite = method === "onsite";
  if (isOnsite) return "Helyszínen";
  if (isTransfer) return "Előre utalással";
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

export default function AdminBookings() {
  const nav = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/bookings?limit=200`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`LIST_FAILED_${res.status}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Nem sikerült betölteni a foglalásokat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doAction = async (id, action) => {
    setError("");

    if (action === "cancel" && !window.confirm("Biztosan lemondod ezt a foglalást?"))
      return;

    if (
      (action === "pay_transfer" || action === "pay_onsite") &&
      !window.confirm("Biztosan fizetettnek jelölöd ezt a foglalást?")
    )
      return;

    if (action === "confirm" && !window.confirm("Biztosan elfogadod ezt a foglalást?"))
      return;

    setActingId(id);
    try {
      let url = `${API}/api/admin/bookings/${id}`;
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
      // backend error kódot ne mutassuk “csúnyán”
      const msg = String(e?.message || "");
      const pretty =
        msg === "ONLY_PENDING_CAN_BE_CONFIRMED"
          ? "Csak a várakozó foglalásokat lehet elfogadni."
          : msg === "CANNOT_CANCEL_PAID"
          ? "Fizetett foglalást nem lehet lemondani."
          : msg === "ONLY_CONFIRMED_CAN_BE_PAID"
          ? "Csak az elfogadott foglalás jelölhető fizetettnek."
          : msg === "ONLY_TRANSFER_CAN_BE_PAID"
          ? "Ez csak előre utalásnál használható."
          : msg === "ONLY_ONSITE_CAN_BE_PAID_ONSITE"
          ? "Ez csak helyszíni fizetésnél használható."
          : "A művelet nem sikerült.";

      setError(pretty);
    } finally {
      setActingId(null);
    }
  };

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const ad = new Date(a?.createdAt || 0).getTime();
      const bd = new Date(b?.createdAt || 0).getTime();
      return bd - ad;
    });
  }, [bookings]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Foglalások</h2>
        <button
          onClick={load}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          Frissítés
        </button>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border bg-white p-4">
        {loading ? (
          <p className="text-sm text-gray-600">Betöltés…</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-gray-600">Nincs foglalás.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr className="border-b">
                  <th className="py-2 pr-3">Kód</th>
                  <th className="py-2 pr-3">Vendég neve</th>
                  <th className="py-2 pr-3">Érkezés</th>
                  <th className="py-2 pr-3">Távozás</th>
                  <th className="py-2 pr-3">Foglalás állapota</th>
                  <th className="py-2 pr-3">Fizetés módja</th>
                  <th className="py-2 pr-3">Műveletek</th>
                </tr>
              </thead>

              <tbody>
                {sorted.map((b) => {
                  const id = b?._id;
                  const status = b?.status;

                  const payMethod = b?.payment?.method;
                  const isTransfer =
                    payMethod === "transfer" || b?.payment?.transferRequested === true;
                  const isOnsite = payMethod === "onsite";

                  const canConfirm = status === "pending";
                  const canCancel =
                    status !== "paid" && ["pending", "confirmed"].includes(status);

                  const canPayTransfer = status === "confirmed" && isTransfer;
                  const canPayOnsite = status === "confirmed" && isOnsite;

                  const busy = actingId === id;

                  return (
                    <tr key={id} className="border-b last:border-b-0">
                      <td className="py-2 pr-3">
                        <button
                          className="font-mono underline underline-offset-2 hover:opacity-80"
                          onClick={() => nav(`/admin/bookings/${id}`)}
                          title="Részletek megnyitása"
                        >
                          {b?.code || "-"}
                        </button>
                      </td>
                      <td className="py-2 pr-3">{b?.customer?.name || "-"}</td>
                      <td className="py-2 pr-3">{fmtDate(b?.checkIn)}</td>
                      <td className="py-2 pr-3">{fmtDate(b?.checkOut)}</td>
                      <td className="py-2 pr-3">
                        <span className={badgeClass(status)}>
                          {statusLabel(status)}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                          {paymentLabel(b?.payment)}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                            disabled={!canConfirm || busy}
                            onClick={() => doAction(id, "confirm")}
                          >
                            Elfogad
                          </button>

                          <button
                            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                            disabled={!canCancel || busy}
                            onClick={() => doAction(id, "cancel")}
                          >
                            Lemondás
                          </button>

                          <button
                            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                            disabled={!canPayTransfer || busy}
                            onClick={() => doAction(id, "pay_transfer")}
                          >
                            Fizetve – utalás
                          </button>

                          <button
                            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                            disabled={!canPayOnsite || busy}
                            onClick={() => doAction(id, "pay_onsite")}
                          >
                            Fizetve – helyszínen
                          </button>
                        </div>

                        {busy ? (
                          <div className="mt-1 text-xs text-gray-500">Mentés…</div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
