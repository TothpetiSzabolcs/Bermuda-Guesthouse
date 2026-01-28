import { useEffect, useState, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "";

export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [loading, setL] = useState(true);

  const refresh = useCallback(async () => {
    setL(true);
    try {
      const r = await fetch(`${API}/api/admin/me`, {
        credentials: "include",
        cache: "no-store",                   // <— fontos
        headers: { "Cache-Control": "no-cache" },
      });
      if (r.ok) setUser(await r.json());
      else setUser(null);
    } finally {
      setL(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (username, password) => {
    const r = await fetch(`${API}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) throw new Error("Login failed");

    // itt már megjött a Set-Cookie — erőltessünk egy friss /me-t cache nélkül
    await refresh();
  };

  const logout = async () => {
    try { await fetch(`${API}/api/admin/logout`, { method: "POST", credentials: "include" }); }
    finally { setUser(null); }
  };

  return { user, loading, isAuthed: !!user, refresh, login, logout };
}

