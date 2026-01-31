import { useEffect, useState } from "react";

const RAW_API = import.meta.env.VITE_API_URL;

function resolveBase() {
  try {
    const u = new URL(RAW_API || window.location.origin);
    if (
      (u.hostname === "localhost" || u.hostname === "127.0.0.1") &&
      window.location.hostname
    ) {
      u.hostname = window.location.hostname;
    }
    return u.origin;
  } catch {
    return RAW_API || window.location.origin;
  }
}

export function useRoom(slug, opts = {}) {
  const { lang = "hu" } = opts;
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);
  const [error, setErr] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    setL(true);
    setErr(null);
    setStatus(null);

    const base = resolveBase();
    const url = new URL(`/api/rooms/${slug}`, base);
    url.searchParams.set("lang", lang);

    fetch(url.toString(), { signal: controller.signal })
      .then(async (r) => {
        setStatus(r.status);
        if (!r.ok) {
          const text = await r.text().catch(() => "");
          throw Object.assign(
            new Error(`HTTP ${r.status} ${r.statusText}${text ? ` — ${text}` : ""}`),
            { status: r.status }
          );
        }
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setErr(e);
      })
      .finally(() => setL(false));

    return () => controller.abort();
  }, [slug, lang]);

  return { data, loading, error, status };
}
