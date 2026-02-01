import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

const BookingForm = ({ room, onClose }) => {
  const { t, lang } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    message: "",
    acceptTerms: false,
    offroadOption: false
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
      acceptTermsRequired: "A foglaláshoz el kell fogadni az ÁSZF-t és adatkezelési tájékoztatót",
      success: "Foglalási igény elküldve! Hamarosan visszajelzünk.",
      error: "Hiba történt. Kérjük, próbáld újra később.",
      offroadOption: "Off-road túra",
      offroadWarning: "Mar 1 – Aug 15 között egyeztetés kötelező"
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
      acceptTermsRequired: "You must accept the Terms and Privacy Policy to book",
      success: "Booking request sent! We'll get back to you soon.",
      error: "An error occurred. Please try again later.",
      offroadOption: "Off-road tour",
      offroadWarning: "Mar 1 – Aug 15: coordination required"
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
      acceptTermsRequired: "Sie müssen die AGB und Datenschutzerklärung akzeptieren",
      success: "Buchungsanfrage gesendet! Wir melden uns bald bei Ihnen.",
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      offroadOption: "Offroad-Tour",
      offroadWarning: "Mar 1 – Aug 15: Absprache erforderlich"
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

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = COPY.acceptTermsRequired;
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "guests" ? parseInt(value) || 1 : value)
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
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{COPY.success}</h3>
        <p className="text-gray-600 mb-6 text-lg">
          {COPY.hu ? `Foglalási kód: ${submitStatus.data.code}` : `Booking code: ${submitStatus.data.code}`}
        </p>
        <button
          onClick={onClose}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          {COPY.hu ? "Bezárás" : "Close"}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Room Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {COPY.roomLabel}
        </label>
        <div className="text-lg font-medium text-gray-900">{room.name}</div>
      </div>

      {/* Error Message */}
      {submitStatus?.type === "error" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {submitStatus.message}
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
            {COPY.nameLabel} *
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
            {COPY.emailLabel} *
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="checkIn">
              {COPY.checkInLabel} *
            </label>
            <input
              id="checkIn"
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.checkIn ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
              required
            />
            {errors.checkIn && (
              <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="checkOut">
              {COPY.checkOutLabel} *
            </label>
            <input
              id="checkOut"
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              min={formData.checkIn || new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.checkOut ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
              required
            />
            {errors.checkOut && (
              <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="guests">
            {COPY.guestsLabel} *
          </label>
          <input
            id="guests"
            type="number"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            min="1"
            max={room.capacity || room.guests || 10}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
              errors.guests ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
            required
          />
          {errors.guests && (
            <p className="mt-1 text-sm text-red-600">{errors.guests}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">
            {COPY.messageLabel}
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors resize-none"
            disabled={isSubmitting}
            placeholder={COPY.hu ? "Esetleges megjegyzések..." : "Any special requests..."}
          />
        </div>

        <div>
          <div className="flex items-start">
            <input
              id="offroadOption"
              type="checkbox"
              name="offroadOption"
              checked={formData.offroadOption}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              disabled={isSubmitting}
            />
            <label htmlFor="offroadOption" className="ml-3 text-sm text-gray-700 leading-relaxed">
              {t("booking.offroad.option") || COPY.offroadOption}
            </label>
          </div>
          {formData.offroadOption && (
            <div className="mt-2 ml-7 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 break-words">
                {t("booking.offroad.warning") || COPY.offroadWarning}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start">
            <input
              id="acceptTerms"
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className={`mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ${
                errors.acceptTerms ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-700 leading-relaxed">
              {COPY.hu ? "Elolvastam és elfogadom az " : "I have read and accept the "}
              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {COPY.hu ? "Adatkezelési tájékoztatót" : "Privacy Policy"}
              </Link>
              {COPY.hu ? " és az " : " and the "}
              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {COPY.hu ? "Általános Szerződési Feltételeket" : "Terms and Conditions"}
              </Link>
              {COPY.hu ? "." : "."}
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {COPY.cancelButton}
          </button>
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-green-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (COPY.hu ? "Küldés..." : "Sending...") : COPY.submitButton}
          </button>
        </div>
      </form>
    </>
  );
};

export default BookingForm;