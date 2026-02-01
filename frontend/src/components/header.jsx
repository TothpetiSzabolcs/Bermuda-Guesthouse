import React, { useState, useEffect } from "react";
import { useI18n } from "../i18n/useI18n";
import logo from "../assets/BV_logo.png";
import { Link, useLocation } from "react-router-dom";
import BookingModal from "./BookingModal";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { lang, setLang, t } = useI18n();
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "/home";

  useEffect(() => {
    let ticking = false;
    const threshold = 30;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const threshold = 30;
    setScrolled(window.scrollY > threshold);
    setOpen(false);
  }, [pathname]);

  const onHero = isHome && !scrolled;

  const navItems = [
    { key: "nav.home", hash: "hero" },
    { key: "nav.rooms", hash: "rooms" },
    { key: "nav.experiences", hash: "experiences" },
    { key: "nav.gallery", to: "/gallery" },
    { key: "nav.contact", to: "/contact" },
  ];

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

  const headerClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    onHero ? "bg-transparent" : "bg-white/90 backdrop-blur-sm shadow-sm"
  }`;

  return (
    <header className={headerClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src={logo}
              alt={t("common.adminTitle")}
              className="w-16 h-12 sm:w-20 sm:h-14 object-contain"
            />
            <span
              className={`text-base sm:text-lg font-bold transition-colors duration-300 ${
                onHero ? "text-white drop-shadow-lg" : "text-gray-900"
              }`}
            >
              {t("common.adminTitle")}
            </span>
          </div>

          {/* Desktop nav (>=985px) */}
          <nav className="hidden [@media(min-width:1073px)]:flex items-center gap-8">
            {navItems.map((item) =>
              renderNav(
                item,
                `relative group px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                  onHero
                    ? "text-white hover:text-emerald-300 drop-shadow-lg"
                    : "text-gray-700 hover:text-green-700"
                }`,
                undefined,
                isHome
              )
            )}
          </nav>

          {/* Desktop controls (>=985px) */}
          <div className="hidden [@media(min-width:1073px)]:flex items-center gap-3">
            <select
              aria-label={t("common.language")}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-600 min-w-[4rem] ${
                onHero
                  ? "border-white/40 bg-white/20 backdrop-blur-sm text-gray-900 shadow-sm"
                  : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              <option value="hu">HU</option>
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>

            <button
              onClick={() => setBookingModalOpen(true)}
              className={`px-6 py-2 rounded-lg transition-colors text-sm font-medium ${
                onHero
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-green-700 text-white hover:bg-green-800"
              }`}
            >
              {t("nav.book")}
            </button>
          </div>

          {/* Mobile hamburger (<985px) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="[@media(min-width:1073px)]:hidden inline-flex items-center justify-center p-3 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-600 min-h-[44px] min-w-[44px]"
            aria-label={t("common.menu")}
            aria-expanded={open}
          >
            <span
              className={`relative block h-6 w-8 transition-colors duration-300 ${
                onHero ? "text-white" : "text-gray-700"
              }`}
            >
              <span
                className={`absolute left-0 top-0 h-0.5 w-8 bg-current transition-transform ${
                  open ? "translate-y-3 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-8 bg-current transition-opacity ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 bottom-0 h-0.5 w-8 bg-current transition-transform ${
                  open ? "-translate-y-3 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        {/* Mobile menu (<985px) */}
        {open && (
          <div
            className={`[@media(min-width:1073px)]:hidden border-t transition-colors duration-300 ${
              onHero ? "bg-white/95 backdrop-blur-sm" : "bg-white"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
                <label
                  className={`text-sm transition-colors duration-300 ${
                    onHero ? "text-gray-800" : "text-gray-600"
                  }`}
                >
                  {t("common.language")}:
                </label>

                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 min-w-[4rem] flex-shrink-0"
                >
                  <option value="hu" className="font-medium">
                    HU
                  </option>
                  <option value="en" className="font-medium">
                    EN
                  </option>
                  <option value="de" className="font-medium">
                    DE
                  </option>
                </select>
              </div>

              {navItems.map((item) =>
                renderNav(
                  item,
                  `block w-full text-left px-3 py-3 text-base font-medium transition-colors rounded-md min-h-[44px] flex items-center ${
                    onHero
                      ? "text-gray-800 hover:text-green-700 hover:bg-gray-50"
                      : "text-gray-700 hover:text-green-700 hover:bg-gray-50"
                  }`,
                  () => setOpen(false),
                  isHome
                )
              )}

              <button
                onClick={() => {
                  setOpen(false);
                  setBookingModalOpen(true);
                }}
                className="mt-2 block w-full text-left bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                {t("nav.book")}
              </button>
            </div>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        mode="picker"
      />
    </header>
  );
};

export default Header;
