import React, { useState, useCallback, useEffect, useRef } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cld } from "../utils/cloudinary";

const ImageLightbox = ({ images = [], initialIndex = 0, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const MIN_SWIPE = 50;

  const hasMany = images.length > 1;

  const goPrev = useCallback(() => {
    if (!hasMany) return;
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [hasMany, images.length]);

  const goNext = useCallback(() => {
    if (!hasMany) return;
    setActiveIndex((i) => (i + 1) % images.length);
  }, [hasMany, images.length]);

  // ── Keyboard navigation ──────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  // ── Lock body scroll ─────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Touch / swipe ────────────────────────────────────
  const onTouchStart = useCallback((e) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > MIN_SWIPE) goNext();
    if (distance < -MIN_SWIPE) goPrev();
    touchStartX.current = null;
    touchEndX.current = null;
  }, [goNext, goPrev]);

  const currentRaw = images[activeIndex] || null;
  const imgSrc = currentRaw ? cld(currentRaw, "f_auto,q_auto,w_1600") : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-white/15 hover:bg-white/30 p-2.5 text-white transition-colors"
        aria-label="Close"
      >
        <FiX className="w-6 h-6" />
      </button>

      {/* Counter */}
      {hasMany && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white">
          {activeIndex + 1} / {images.length}
        </div>
      )}

      {/* Prev / Next arrows */}
      {hasMany && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/15 hover:bg-white/30 p-2.5 sm:p-3 text-white transition-colors"
            aria-label="Previous"
          >
            <FiChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/15 hover:bg-white/30 p-2.5 sm:p-3 text-white transition-colors"
            aria-label="Next"
          >
            <FiChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </>
      )}

      {/* Image */}
      <div
        className="w-full h-full flex items-center justify-center px-4 sm:px-16 py-16"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {imgSrc && (
          <img
            key={activeIndex}
            src={imgSrc}
            alt={`Image ${activeIndex + 1} of ${images.length}`}
            className="max-w-full max-h-full object-contain select-none rounded-lg"
            draggable={false}
          />
        )}
      </div>

      {/* Thumbnail strip (desktop only) */}
      {hasMany && images.length <= 20 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 hidden sm:flex gap-2 max-w-[80vw] overflow-x-auto px-3 py-2 rounded-xl bg-black/50">
          {images.map((raw, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(i);
              }}
              className={`flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-white opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={cld(raw, "f_auto,q_auto,w_100,h_70,c_fill")}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;