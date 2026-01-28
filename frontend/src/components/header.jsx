import React, { useState } from "react";
import { useI18n } from "../i18n/LanguageProvider";
import logo from "../assets/BV_logo.png";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useI18n();
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "/home";

  // Menü: hash = oldalon belüli szekció
  const navItems = [
    { key: "nav.home",        hash: "hero" },
    { key: "nav.rooms",       hash: "rooms" },
    { key: "nav.experiences", hash: "experiences" },
    { key: "nav.gallery",     hash: "gallery" },
    { key: "nav.contact",     to: "/contact" },
  ];

  // Simított görgetés fix header offsettel
  const handleHashClick = (e, hash) => {
    e.preventDefault();
    const el = document.getElementById(hash);
    if (!el) return;
    const offset = 64;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
    setOpen(false);
  };

  const renderNav = (item, className, onClick, isHomePage) => {
    const underline = (
      <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 bg-green-700 transition-all duration-200 group-hover:w-full" />
    );

    if (item.hash) {
      return isHomePage ? (
        <a
          key={item.key}
          href={`#${item.hash}`}
          onClick={(e) => handleHashClick(e, item.hash)}
          className={className}
        >
          {t(item.key)}
          {underline}
        </a>
      ) : (
        <Link
          key={item.key}
          to={`/#${item.hash}`}
          onClick={onClick}
          className={className}
        >
          {t(item.key)}
          {underline}
        </Link>
      );
    }

    return (
      <Link key={item.key} to={item.to} className={className} onClick={onClick}>
        {t(item.key)}
        {underline}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Felső sor */}
        <div className="flex h-16 items-center justify-between">
          {/* Logó + márka */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Bermuda Vendégház" className="w-20 h-15" />
            <span className="text-lg font-bold text-gray-900">Bermuda Vendégház</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) =>
              renderNav(
                item,
                "relative group px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors",
                undefined,
                isHome
              )
            )}
          </nav>

          {/* Desktop CTA + nyelv */}
          <div className="hidden md:flex items-center gap-3">
            <select
              aria-label={t("common.language")}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-md border border-gray-300 bg-white/80 px-3 py-2 text-sm text-gray-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="hu">HU</option>
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
            <Link
              to="/booking"
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm font-medium"
            >
              {t("nav.book")}
            </Link>
          </div>

          {/* Mobil menü gomb */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
            aria-label="Menü"
            aria-expanded={open}
          >
            <span className="relative block h-6 w-8">
              <span className={`absolute left-0 top-0 h-0.5 w-8 bg-current transition-transform ${open ? "translate-y-3 rotate-45" : ""}`} />
              <span className={`absolute left-0 top-3 h-0.5 w-8 bg-current transition-opacity ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 bottom-0 h-0.5 w-8 bg-current transition-transform ${open ? "-translate-y-3 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>

        {/* Mobil nav */}
        {open && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Nyelvválasztó */}
              <div className="flex items-center gap-2 px-3 py-2">
                <label className="text-sm text-gray-600">{t("common.language")}:</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white/80 px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="hu">HU</option>
                  <option value="en">EN</option>
                  <option value="de">DE</option>
                </select>
              </div>

              {navItems.map((item) =>
                renderNav(
                  item,
                  "block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50 transition-colors rounded-md",
                  () => setOpen(false),
                  isHome
                )
              )}

              <Link
                to="/booking"
                onClick={() => setOpen(false)}
                className="mt-2 block w-full text-left bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                {t("nav.book")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
