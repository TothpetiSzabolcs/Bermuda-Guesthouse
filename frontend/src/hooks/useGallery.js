// src/hooks/useGallery.js
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

export function useGallery(propertySlug, opts = {}) {
  const {
    category = "all",
    page = 1,
    limit = 24,
    enabled = true,
  } = opts;

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setL] = useState(false);
  const [error, setErr] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setTotal(0);
      setL(false);
      setErr(null);
      return;
    }

    const controller = new AbortController();
    setL(true); setErr(null);

    const base = (API && API.trim()) || window.location.origin;
    const url = new URL("/api/public/gallery", base);
    url.searchParams.set("propertySlug", propertySlug);
    if (category) url.searchParams.set("category", category);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    fetch(url.toString(), { signal: controller.signal, credentials: "omit" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setItems(json.items || []);
        setTotal(json.total || 0);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setErr(e);
      })
      .finally(() => setL(false));

    return () => controller.abort();
  }, [propertySlug, category, page, limit, enabled]);

  return { items, total, loading, error };
}
