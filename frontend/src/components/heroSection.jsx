import React, { useState } from "react";
import bg from "../assets/welcome_screen_bg.jpg";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";
import { HiOutlineLocationMarker } from "react-icons/hi";
import MapPanel from "./MapPanel";

const HeroSection = () => {
  const { t } = useI18n();
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <div id="hero" className="relative h-screen w-full overflow-hidden">
      <img src={bg} alt="background" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />

      <div className="relative z-10 h-full w-full flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl sm:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
              <HiOutlineLocationMarker className="w-8 h-8 text-emerald-400" />
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

            <div className="mt-5 flex items-center gap-3 text-white/90">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049.927l2.2 6.778h7.122l-5.761 4.186 2.2 6.778-5.761-4.186-5.761 4.186 2.2-6.778L-.273 7.705h7.122l2.2-6.778z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm sm:text-base">{t("hero.rating")}</span>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/rooms"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-medium transition"
              >
                {t("hero.cta")}
              </Link>
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

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white animate-bounce hidden lg:block">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>

      {/* Map Panel */}
      <MapPanel isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </div>
  );
};

export default HeroSection;
