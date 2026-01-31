import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ANIM_MS = 200; // 150–250ms között oké

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  className = "",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}) => {
  const [mounted, setMounted] = useState(false);

  // shouldRender: maradjon a DOM-ban záráskor is, hogy az exit anim lefusson
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const prevBodyOverflowRef = useRef("");
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const focusTimerRef = useRef(null);

  // Track mount (portal target safety)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Open/close state machine + animációk
  useEffect(() => {
    // Takarítás
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    if (isOpen) {
      setShouldRender(true);
      // Következő tick: enter anim
      openTimerRef.current = setTimeout(() => setIsVisible(true), 10);
    } else {
      // Exit anim
      setIsVisible(false);
      closeTimerRef.current = setTimeout(() => setShouldRender(false), ANIM_MS);
    }

    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen]);

  // Scroll lock (NEM timeoutos, cleanup-pal biztos)
  useEffect(() => {
    if (!shouldRender) return;

    // nyitáskor mentjük a fókuszt és a body overflow-t
    previousFocusRef.current = document.activeElement;
    prevBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      // zárás/unmount esetén biztos visszaáll
      document.body.style.overflow = prevBodyOverflowRef.current || "";
    };
  }, [shouldRender]);

  // Restore focus amikor teljesen bezárt (amikor már le is renderelődött)
  useEffect(() => {
    if (shouldRender) return;

    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    // kis delay, hogy biztosan ne a már unmountolt elemre fókuszáljon
    focusTimerRef.current = setTimeout(() => {
      previousFocusRef.current?.focus?.();
    }, 0);

    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, [shouldRender]);

  // ESC key
  useEffect(() => {
    if (!shouldRender) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && closeOnEscape) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [shouldRender, onClose, closeOnEscape]);

  // Focus trap
  useEffect(() => {
    if (!shouldRender || !modalRef.current) return;

    const el = modalRef.current;

    const getFocusable = () =>
      el.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );



    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const currentFocusable = getFocusable();
      const firstEl = currentFocusable[0];
      const lastEl = currentFocusable[currentFocusable.length - 1];

      if (!firstEl || !lastEl) return;

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          lastEl.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastEl) {
          firstEl.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleTab);

    // fókusz be a modalba nyitáskor
    const t = setTimeout(() => {
      const currentFocusable = getFocusable();
      (currentFocusable[0] || el).focus?.();
    }, 50);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", handleTab);
    };
  }, [shouldRender]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) onClose();
  };

  const modalId = `modal-${title?.replace(/\s+/g, "-").toLowerCase() || "dialog"}`;

  if (!shouldRender) return null;

  const modalUi = (
    <div
      className="fixed inset-0 z-[2147483647] isolate flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${modalId}-title` : undefined}
        aria-describedby={title ? `${modalId}-description` : undefined}
        tabIndex={-1}
        className={`relative w-full max-w-lg transform transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        } ${className}`}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Bezárás"
            type="button"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="relative w-full rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 md:p-8">
          {title && (
            <div className="mb-6">
              <h2 id={`${modalId}-title`} className="text-xl font-semibold text-gray-900 md:text-2xl">
                {title}
              </h2>
              <div id={`${modalId}-description`} className="sr-only">
                {title} dialógus ablak
              </div>
            </div>
          )}

          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );

  // Safe portal
  if (!mounted || typeof document === "undefined" || !document.body) {
    return modalUi;
  }

  return createPortal(modalUi, document.body);
};

export default Modal;
