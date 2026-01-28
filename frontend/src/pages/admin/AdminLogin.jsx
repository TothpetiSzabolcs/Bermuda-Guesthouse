import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminLogin() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const { login } = useAdminAuth();
  const nav = useNavigate();


  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(username, password);
      nav("/admin", { replace: true });
    } catch {
      setErr("Hibás belépési adatok");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-semibold mb-4">Admin bejelentkezés</h1>
        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
        <label className="block text-sm font-medium">Felhasználónév</label>
        <input value={username} onChange={(e)=>setU(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2" required />
        <label className="block text-sm font-medium mt-3">Jelszó</label>
        <input type="password" value={password} onChange={(e)=>setP(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2" required />
        <button className="mt-4 w-full rounded bg-emerald-600 hover:bg-emerald-700 text-white py-2 font-medium">
          Belépés
        </button>
      </form>
    </div>
  );
}
