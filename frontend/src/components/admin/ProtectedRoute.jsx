import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAdminAuth();
  const loc = useLocation();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!isAuthed) return <Navigate to="/admin/login" state={{ from: loc }} replace />;
  return children;
}
