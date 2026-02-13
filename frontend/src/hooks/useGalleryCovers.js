import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5555";

export function useGalleryCovers(propertySlug, categories = []) {
  const [covers, setCovers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const catsParam = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return "";
    return categories.join(",");
  }, [categories]);

  useEffect(() => {
    if (!propertySlug) return;

    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(`${API_BASE}/api/public/gallery/covers`);
        url.searchParams.set("propertySlug", propertySlug);
        if (catsParam) url.searchParams.set("categories", catsParam);

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`covers http ${res.status}`);

        const data = await res.json();
        setCovers(data?.covers || {});
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e);
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [propertySlug, catsParam]);

  return { covers, loading, error };
}
