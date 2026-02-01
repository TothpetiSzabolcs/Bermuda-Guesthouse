import React, { useState } from "react";
import bg from "../assets/welcome_screen_bg.jpg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";
import { HiOutlineLocationMarker } from "react-icons/hi";
import MapPanel from "./MapPanel";

const HeroSection = () => {
  const { t } = useI18n();
  const [isMapOpen, setIsMapOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollToRooms = (e) => {
    e.preventDefault();

    // ha HOME-on vagyunk, scroll
    if (location.pathname === "/") {
      const el = document.getElementById("rooms");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // ha nem HOME, menjünk át és ott scrollozzunk
    navigate("/?scrollTo=rooms");
  };

  return (
    <div id="hero" className="relative h-screen w-full overflow-hidden">
      <img
        src={bg}
        alt={t("hero.bgAlt") || "Bermanda Vendégház - háttérkép"}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />

      <div className="relative z-10 h-full w-full flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl sm:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
              <HiOutlineLocationMarker className="w-8 h-8 text-emerald-400 shrink-0" />
              {t("hero.badge")}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
              {t("hero.titlePrefix")}
              <span className="text-emerald-500 text-4xl sm:text-5xl md:text-6xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                {t("hero.highlight")}
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl md:text-left sm:text-center">
              {t("hero.description")}
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              {/* ✅ scroll-to-rooms */}
              <a
                href="#rooms"
                onClick={handleScrollToRooms}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-medium transition"
              >
                {t("hero.cta")}
              </a>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 text-white/95 hover:bg-white/10 px-6 py-3 font-medium transition"
              >
                {t("hero.contact")}
              </Link>

              <button
                onClick={() => setIsMapOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-white/40 text-white/95 hover:bg-white/10 px-6 py-3 font-medium transition"
              >
                {t("hero.map")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MapPanel isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </div>
  );
};

export default HeroSection;
