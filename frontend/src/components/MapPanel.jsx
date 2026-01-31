import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/useI18n";
import {
  HiX,
  HiOutlineLocationMarker,
  HiOutlineExternalLink,
} from "react-icons/hi";

const MapPanel = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const iframeRef = useRef(null);

  const [mapMounted, setMapMounted] = useState(false); // mikor tegyük be az iframe-et
  const [iframeLoaded, setIframeLoaded] = useState(false); // mikor töltött be ténylegesen

  // Guesthouse location (update with actual location)
  const guesthouseLocation = "Bermuda Vendégház, Somogy, Hungary";

  const googleMapsEmbedUrl = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${
        import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY
      }&q=${encodeURIComponent(guesthouseLocation)}&zoom=15&maptype=roadmap`
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        guesthouseLocation,
      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handlePlanRoute = () => {
    const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      guesthouseLocation,
    )}`;
    window.open(routeUrl, "_blank");
  };

  // ✅ Auto mount iframe on open + reset on close
  useEffect(() => {
    if (isOpen) {
      setMapMounted(true);
      setIframeLoaded(false);
    } else {
      // reset (következő nyitásnál tiszta legyen)
      setMapMounted(false);
      setIframeLoaded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Map Panel */}
      <div className="relative w-full max-w-4xl bg-white rounded-t-2xl shadow-2xl transform transition-all duration-300 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <HiOutlineLocationMarker className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t("hero.map")}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={t("hero.hideMap")}
          >
            <HiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Map Content */}
        <div className="p-4 space-y-4">
          <div
            className="relative rounded-lg overflow-hidden bg-gray-100"
            style={{ paddingBottom: "60%" }}
          >
            {/* ✅ Loading overlay */}
            {!iframeLoaded && (
              <div className="absolute inset-0 z-10 grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="animate-spin h-6 w-6 text-emerald-600"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {t("common.loading")}
                  </span>
                </div>
              </div>
            )}

            {/* ✅ Iframe */}
            {mapMounted && (
              <iframe
                ref={iframeRef}
                src={googleMapsEmbedUrl}
                className="absolute inset-0 w-full h-full border-0"
                title={t("hero.map")}
                loading="lazy"
                allowFullScreen
                onLoad={() => setIframeLoaded(true)}
              />
            )}
          </div>

          {/* Route planning button */}
          <div className="flex justify-center">
            <button
              onClick={handlePlanRoute}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              <HiOutlineExternalLink className="w-4 h-4" />
              {t("hero.planRoute")}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MapPanel;
