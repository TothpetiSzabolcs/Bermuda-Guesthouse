import React, { useEffect, useRef, useState } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  className = "",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const contentRef = useRef(null);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement;
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      // Trigger enter animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Re-enable body scroll after animation
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 200);
    }
  }, [isOpen]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

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

    document.addEventListener('keydown', handleTab);
    
    // Focus first element when modal opens
    if (firstElement) {
      setTimeout(() => firstElement.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const modalId = `modal-${title?.replace(/\s+/g, '-').toLowerCase() || 'dialog'}`;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
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
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        } ${className}`}
      >
        {/* Close Button */}
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

        {/* Content Card */}
        <div 
          ref={contentRef}
          className="relative w-full rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 md:p-8"
        >
          {/* Title */}
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

          {/* Children Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;