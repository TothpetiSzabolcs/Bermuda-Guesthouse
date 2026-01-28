import React, { useState } from "react";
import { useI18n } from "../i18n/LanguageProvider";

const BookingForm = ({ room, onClose }) => {
  const { lang } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const COPY = {
    hu: {
      title: "Foglalás",
      roomLabel: "Szoba",
      nameLabel: "Név",
      emailLabel: "Email",
      checkInLabel: "Érkezés",
      checkOutLabel: "Távozás",
      guestsLabel: "Vendégek száma",
      messageLabel: "Üzenet (opcionális)",
      submitButton: "Foglalási igény elküldése",
      cancelButton: "Mégsem",
      required: "Kötelező mező",
      invalidEmail: "Érvényes email címet adj meg",
      invalidDate: "Érvényes dátumot adj meg",
      invalidGuests: "Legalább 1 vendég szükséges",
      success: "Foglalási igény elküldve! Hamarosan visszajelzünk.",
      error: "Hiba történt. Kérjük, próbáld újra később."
    },
    en: {
      title: "Booking",
      roomLabel: "Room",
      nameLabel: "Name",
      emailLabel: "Email",
      checkInLabel: "Check-in",
      checkOutLabel: "Check-out",
      guestsLabel: "Number of Guests",
      messageLabel: "Message (optional)",
      submitButton: "Send Booking Request",
      cancelButton: "Cancel",
      required: "Required field",
      invalidEmail: "Please enter a valid email",
      invalidDate: "Please enter a valid date",
      invalidGuests: "At least 1 guest is required",
      success: "Booking request sent! We'll get back to you soon.",
      error: "An error occurred. Please try again later."
    },
    de: {
      title: "Buchung",
      roomLabel: "Zimmer",
      nameLabel: "Name",
      emailLabel: "Email",
      checkInLabel: "Anreise",
      checkOutLabel: "Abreise",
      guestsLabel: "Anzahl der Gäste",
      messageLabel: "Nachricht (optional)",
      submitButton: "Buchungsanfrage senden",
      cancelButton: "Abbrechen",
      required: "Pflichtfeld",
      invalidEmail: "Bitte gültige Email eingeben",
      invalidDate: "Bitte gültiges Datum eingeben",
      invalidGuests: "Mindestens 1 Gast erforderlich",
      success: "Buchungsanfrage gesendet! Wir melden uns bald bei Ihnen.",
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
    }
  }[lang] || COPY.hu;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = COPY.required;
    }

    if (!formData.email.trim()) {
      newErrors.email = COPY.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = COPY.invalidEmail;
    }

    if (!formData.checkIn) {
      newErrors.checkIn = COPY.required;
    } else {
      const checkInDate = new Date(formData.checkIn);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate < today) {
        newErrors.checkIn = COPY.invalidDate;
      }
    }

    if (!formData.checkOut) {
      newErrors.checkOut = COPY.required;
    } else if (formData.checkIn) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = COPY.invalidDate;
      }
    }

    if (!formData.guests || formData.guests < 1) {
      newErrors.guests = COPY.invalidGuests;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property: "bermuda-vendeghaz",
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          items: [
            {
              room: room._id || room.id,
              guests: formData.guests
            }
          ],
          customer: {
            name: formData.name,
            email: formData.email,
            note: formData.message
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus({ type: "success", data: result });
        setFormData({
          name: "",
          email: "",
          checkIn: "",
          checkOut: "",
          guests: 1,
          message: ""
        });
      } else {
        const errorData = await response.json();
        setSubmitStatus({ type: "error", message: errorData.error || COPY.error });
      }
    } catch {
      setSubmitStatus({ type: "error", message: COPY.error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) || 1 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  if (submitStatus?.type === "success") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{COPY.success}</h3>
            <p className="text-gray-600 mb-4">
              {COPY.hu ? `Foglalási kód: ${submitStatus.data.code}` : `Booking code: ${submitStatus.data.code}`}
            </p>
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {COPY.hu ? "Bezárás" : "Close"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{COPY.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {COPY.roomLabel}
          </label>
          <div className="text-gray-900">{room.name}</div>
        </div>

        {submitStatus?.type === "error" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {COPY.nameLabel} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {COPY.emailLabel} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {COPY.checkInLabel} *
              </label>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.checkIn ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {errors.checkIn && (
                <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {COPY.checkOutLabel} *
              </label>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.checkOut ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {errors.checkOut && (
                <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {COPY.guestsLabel} *
            </label>
            <input
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              min="1"
              max={room.capacity || room.guests || 10}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.guests ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            {errors.guests && (
              <p className="mt-1 text-sm text-red-600">{errors.guests}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {COPY.messageLabel}
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
              placeholder={COPY.hu ? "Esetleges megjegyzések..." : "Any special requests..."}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              {COPY.cancelButton}
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? (COPY.hu ? "Küldés..." : "Sending...") : COPY.submitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;