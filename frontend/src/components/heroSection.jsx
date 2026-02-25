import React, { useState } from "react";
import bg from "../assets/welcome_screen_bg.webp";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";
import { HiOutlineLocationMarker } from "react-icons/hi";
import MapPanel from "./MapPanel";
import { useReviews } from "../hooks/useReviews";

const HeroSection = () => {
  const { t } = useI18n();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { data: reviewData } = useReviews("bermuda-vendeghaz", 1);

  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollToRooms = (e) => {
    e.preventDefault();

    if (location.pathname === "/") {
      const el = document.getElementById("rooms");
      if (el) {
        const headerHeight = 64;
        const y =
          el.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      return;
    }

    navigate("/?scrollTo=rooms");
  };

  return (
    <div
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-gray-900"
    >
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
              {t("hero.titlePrefix")}{" "}
              <span className="text-emerald-500 text-2xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] block sm:inline">
                {t("hero.highlight")}
              </span>
            </h1>

            {/* Csillagos értékelés */}
            {reviewData?.average ? (
              <div className="mt-3 sm:mb-4 flex items-center justify-center sm:justify-start gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        i < Math.round(Number(reviewData.average))
                          ? "text-yellow-400"
                          : "text-white/30"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm sm:text-base font-semibold text-white">
                  {reviewData.average}
                </span>
                <span className="text-xs sm:text-sm text-white/70">
                  ({reviewData.count}{" "}
                  {t("reviews.hero.countLabel_other", {
                    count: reviewData.count,
                  }).replace(String(reviewData.count) + " ", "")}
                  )
                </span>
              </div>
            ) : null}

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
