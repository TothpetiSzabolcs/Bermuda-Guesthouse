import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

export function useReviews(propertySlug, limit = 6) {
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    if (!propertySlug) {
      setData(null);
      setErr(null);
      setL(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      setL(true);
      setErr(null);

      try {
        const base = (API && API.trim()) || window.location.origin;
        const url = new URL("/api/reviews/property", base);
        url.searchParams.set("propertySlug", propertySlug);
        url.searchParams.set("limit", String(limit));

        const r = await fetch(url.toString(), {
          signal: controller.signal,
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!r.ok) {
          const txt = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} ${txt}`.trim());
        }

        const json = await r.json();
        setData(json);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e);
      } finally {
        setL(false);
      }
    })();

    return () => controller.abort();
  }, [propertySlug, limit]);

  return { data, loading, error };
}
