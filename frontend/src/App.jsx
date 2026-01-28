import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminRooms from "./pages/admin/AdminRooms";
import ProtectedRoute from "./components/admin/ProtectedRoute";
// opcionális: HashScroller ha használod a #rooms/#hero görgetést
// import HashScroller from "./components/HashScroller";

export default function App() {
  return (
    <>
      {/* <HashScroller /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="rooms" element={<AdminRooms />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
