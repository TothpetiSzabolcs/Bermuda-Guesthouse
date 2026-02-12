import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import GalleryPage from "./pages/GalleryPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import ReviewWrite from "./pages/ReviewWrite";
import Reviews from "./pages/Reviews";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminReviews from "./pages/admin/AdminReviews";
import RoomDetail from "./components/RoomDetail";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import HashScroller from "./components/HashScroller";
import NotFound from "./pages/NotFound";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBookingDetails from "./pages/admin/AdminBookingDetails";
import CookieBanner from "./components/CookieBanner";

export default function App() {
  return (
    <>
      <HashScroller />
      <CookieBanner privacyUrl="/privacy" />
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:category" element={<GalleryPage />} />
        <Route path="/rooms/:slug" element={<RoomDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/review/write" element={<ReviewWrite />} />
        <Route path="/reviews" element={<Reviews />} />
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
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="bookings/:id" element={<AdminBookingDetails />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route index element={<AdminDashboard />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
