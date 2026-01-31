import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Track mount (portal target safety)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle animation + body scroll
  useEffect(() => {
    if (!mounted) return;

    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => {
        document.body.style.overflow = "";
      }, 200);
      return () => clearTimeout(t);
    }
  }, [isOpen, mounted]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && closeOnEscape) onClose();
    };

    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleTab);

    if (firstElement) setTimeout(() => firstElement.focus(), 100);

    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) onClose();
  };

  const modalId = `modal-${
    title?.replace(/\s+/g, "-").toLowerCase() || "dialog"
  }`;

  if (!isOpen) return null;

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
        className={`relative w-full max-w-lg transform transition-all duration-200 ${
          isVisible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        } ${className}`}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Bezárás"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        <div className="relative w-full rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 md:p-8">
          {title && (
            <div className="mb-6">
              <h2
                id={`${modalId}-title`}
                className="text-xl font-semibold text-gray-900 md:text-2xl"
              >
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
