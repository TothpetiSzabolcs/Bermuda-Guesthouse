import React, { useState } from "react";
import bg from "../assets/welcome_screen_bg.webp";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";
import { HiOutlineLocationMarker } from "react-icons/hi";
import MapPanel from "./MapPanel";

const HeroSection = () => {
  const { t } = useI18n();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollToRooms = (e) => {
    e.preventDefault();

    if (location.pathname === "/") {
      const el = document.getElementById("rooms");
      if (el) {
        const headerHeight = 64;
        const y = el.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      return;
    }

    navigate("/?scrollTo=rooms");
  };

  return (
    <div id="hero" className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Hero background image – starts invisible, fades in when loaded */}
      <img
        src={bg}
        alt={t("hero.bgAlt") || "Bermuda Vendégház - háttérkép"}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
          imgLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImgLoaded(true)}
        fetchPriority="high"
        decoding="async"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />

      <div className="relative z-10 h-full w-full flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-center sm:text-left">
            <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs sm:text-sm text-white/90">
              <HiOutlineLocationMarker className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm">{t("hero.badge")}</span>
            </div>

            <h1 className="hyphens-none break-normal text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
              {t("hero.titlePrefix")}
              {" "}
              <span className="text-emerald-500 text-2xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] block sm:inline">
                {t("hero.highlight")}
              </span>
            </h1>

            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed">
              {t("hero.description")}
            </p>

            <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="#rooms"
                onClick={handleScrollToRooms}
                className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition min-w-0"
              >
                {t("hero.cta")}
              </a>

              <div className="flex gap-3 sm:flex-1">
                <Link
                  to="/contact"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-white/40 text-white/95 hover:bg-white/10 px-3 sm:px-6 py-3 text-sm sm:text-base font-medium transition min-w-0"
                >
                  {t("hero.contact")}
                </Link>

                <button
                  onClick={() => setIsMapOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-white/40 text-white/95 hover:bg-white/10 px-3 sm:px-6 py-3 text-sm sm:text-base font-medium transition min-w-0"
                >
                  {t("hero.map")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MapPanel isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </div>
  );
};

export default HeroSection;