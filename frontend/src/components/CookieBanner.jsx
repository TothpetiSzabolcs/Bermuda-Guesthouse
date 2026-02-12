import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const KEY = "cookieConsent_v1";

export default function CookieBanner({ privacyUrl = "/privacy" }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (!saved) setOpen(true);
    } catch {
      // ha nincs storage, akkor is mutassuk egyszer
      setOpen(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          necessary: true,
          ts: Date.now(),
        })
      );
    } catch {
      // Silently fail if localStorage is not available
    }
    setOpen(false);
    window.dispatchEvent(new Event("cookie-consent-changed"));
  };

  if (!open || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl border">
        <h3 className="text-lg font-semibold">Cookie tájékoztató</h3>

        <p className="mt-2 text-sm text-gray-600">
          A weboldal a működéshez szükséges cookie-kat használja a megfelelő működés
          biztosításához.
        </p>

        <div className="mt-3 text-sm">
          <a className="underline text-gray-700" href={privacyUrl}>
            Adatkezelési tájékoztató
          </a>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={accept}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
          >
            Rendben
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          A szükséges cookie-k nélkül a weboldal nem tud megfelelően működni.
        </p>
      </div>
    </div>
  );
}
