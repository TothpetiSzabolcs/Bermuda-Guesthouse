import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useI18n } from "../../i18n/useI18n";
import SEO from "../../components/SEO";

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const { t } = useI18n();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${t("admin.layout.title")} – Admin`}
        noindex
        canonicalUrl="https://bermuda-vendeghaz.hu/admin"
      />
      <header className="h-14 bg-white border-b flex items-center justify-between px-4">
        <div className="font-semibold">{t("admin.layout.title")}</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.username}</span>
          <button
            onClick={async () => {
              await logout();
              nav("/admin/login");
            }}
            className="text-sm px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-black"
          >
            Kijelentkezés
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r bg-white">
          <nav className="p-3 flex flex-col gap-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded ${
                  isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                }`
              }
            >
              Vezérlőpult
            </NavLink>
            <NavLink
              to="/admin/gallery"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${
                  isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                }`
              }
            >
              Galéria
            </NavLink>
            <NavLink
              to="/admin/rooms"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${
                  isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                }`
              }
            >
              Szobák
            </NavLink>
            <NavLink
              to="/admin/bookings"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${
                  isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                }`
              }
            >
              Foglalások
            </NavLink>
            <NavLink
              to="/admin/reviews"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${
                  isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                }`
              }
            >
              Vélemények
            </NavLink>
          </nav>
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
