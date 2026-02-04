import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

export function useReviews(propertySlug, limit = 6) {
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);

  useEffect(() => {
    (async () => {
      setL(true);
      try {
        const url = new URL("/api/reviews", API || window.location.origin);
        url.searchParams.set("propertySlug", propertySlug);
        url.searchParams.set("limit", limit);
        const r = await fetch(url);
        setData(await r.json());
      } finally {
        setL(false);
      }
    })();
  }, [propertySlug, limit]);

  return { data, loading };
}
