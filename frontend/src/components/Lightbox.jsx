import React, { useCallback, useEffect, useRef, useState } from "react";

function fsElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
}
function requestFs(el) {
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
  if (el.msRequestFullscreen) return el.msRequestFullscreen();
  return Promise.reject(new Error("Fullscreen API not supported"));
}
function exitFs() {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
  if (document.msExitFullscreen) return document.msExitFullscreen();
  return Promise.resolve();
}

export default function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
  getAlt,
  getImgSrc,
  getVideoSrc,
  getPosterSrc,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const item = items[index];
  const isVideo = item?.resourceType === "video";
  const [, setIsFs] = useState(!!fsElement());

  // Fullscreen változás figyelése: FS-ben play, kilépéskor pause
  useEffect(() => {
    const handler = () => {
      const inFs = !!fsElement();
      setIsFs(inFs);
      const v = videoRef.current;
      if (!v) return;
      if (inFs) v.play().catch(() => {});
      else v.pause();
    };
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    document.addEventListener("mozfullscreenchange", handler);
    document.addEventListener("MSFullscreenChange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
      document.removeEventListener("mozfullscreenchange", handler);
      document.removeEventListener("MSFullscreenChange", handler);
    };
  }, []);

  // Amikor videóra váltunk: azonnal kérjünk fullscreen-t és indítsuk el
  useEffect(() => {
    (async () => {
      if (!isVideo) return;
      if (containerRef.current && !fsElement()) {
        try {
          await requestFs(containerRef.current);
        } catch {
          // ha nincs FS API engedély, legalább próbáljuk lejátszani
        }
      }
      const v = videoRef.current;
      if (v) {
        // Autoplay policy miatt induláskor érdemes némítva; user bármikor felhangosíthatja
        v.muted = true;
        await v.play().catch(() => {});
      }
    })();
  }, [index, isVideo]);

  const handleClose = useCallback(async () => {
    onClose();
    if (fsElement()) await exitFs().catch(() => {});
  }, [onClose]);

  // ESC/nyilak
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onPrev, onNext, handleClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* nav gombok */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white"
        aria-label="Előző"
      >‹</button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white"
        aria-label="Következő"
      >›</button>

      <button
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        className="absolute top-4 right-4 p-2 rounded-md bg-white/20 hover:bg-white/30 text-white"
        aria-label="Bezárás"
      >✕</button>

      <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video
            ref={videoRef}
            controls
            playsInline
            poster={getPosterSrc?.(item)}
            className="max-h-[80vh] w-full rounded-xl bg-black"
          >
            <source src={getVideoSrc(item)} type="video/mp4" />
            <source src={item.url} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={getImgSrc(item)}
            alt={getAlt(item)}
            className="max-h-[80vh] w-full object-contain rounded-xl"
          />
        )}
      </div>
    </div>
  );
}
