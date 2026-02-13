import { useEffect, useState } from "react";

const RAW_API = import.meta.env.VITE_API_URL;

function resolveBase() {
  try {
    const u = new URL(RAW_API || window.location.origin);
    if ((u.hostname === "localhost" || u.hostname === "127.0.0.1") && window.location.hostname) {
      u.hostname = window.location.hostname;
    }
    return u.origin;
  } catch {
    return RAW_API || window.location.origin;
  }
}

export function useRooms(propertySlug = "bermuda-vendeghaz", opts = {}) {
  const { active = "true", lang = "hu" } = opts;
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);
  const [error, setErr] = useState(null);

  
  useEffect(() => {
    const controller = new AbortController();
    setL(true);
    setErr(null);
    
    const base = resolveBase();
    const url = new URL("/api/rooms", base);
    url.searchParams.set("propertySlug", propertySlug);
    url.searchParams.set("active", String(active));
    url.searchParams.set("lang", lang);
    
    const credentials =
      import.meta.env.VITE_WITH_CREDENTIALS === "true" ? "include" : "omit";

    fetch(url.toString(), { signal: controller.signal, credentials })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} ${r.statusText}${text ? ` — ${text}` : ""}`);
        }
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setErr(e);
      })
      .finally(() => setL(false));

    return () => controller.abort();
  }, [propertySlug, active, lang]);

  return { data, loading, error };
}
