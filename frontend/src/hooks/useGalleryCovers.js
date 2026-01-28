// src/hooks/useGalleryCovers.js
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || window.location.origin;

export function useGalleryCovers(propertySlug = "bermuda-vendeghaz") {
  const [covers, setCovers] = useState({});
  const [loading, setL] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setL(true); setErr(null);
    const url = new URL("/api/public/gallery/covers", API);
    url.searchParams.set("propertySlug", propertySlug);

    fetch(url.toString())
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(json => { if (alive) setCovers(json.covers || {}); })
      .catch(e => alive && setErr(e))
      .finally(() => alive && setL(false));

    return () => { alive = false; };
  }, [propertySlug]);

  return { covers, loading, error };
}
