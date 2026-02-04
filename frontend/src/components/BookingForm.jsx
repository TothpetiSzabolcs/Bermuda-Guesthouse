import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

const PAYMENT_DETAILS = {
  beneficiary: "Bermuda Vendégház", // TODO
  bankName: "Bank neve", // TODO
  accountNumber: "50466113-10001356-00000000",
  iban: "HU89 5046 6113 1000 1356 0000 0000",
  swift: "ABCDEFGH", // TODO
};

const BookingForm = ({ room, onClose }) => {
  const { t, lang } = useI18n();

  const COPY = useMemo(() => {
    const dict = {
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
        acceptTermsRequired:
          "A foglaláshoz el kell fogadni az ÁSZF-t és adatkezelési tájékoztatót",
        success: "Foglalási igény elküldve! Hamarosan visszajelzünk.",
        error: "Hiba történt. Kérjük, próbáld újra később.",
        offroadOption: "Off-road túra",
        offroadWarning: "Mar 1 – Aug 15 között egyeztetés kötelező",

        paymentTitle: "Fizetési mód",
        payOnSite: "Fizetés a helyszínen",
        payByTransfer: "Banki előreutalás",
        transferNote: "Előreutalás – a visszaigazolás után",
        transferDetailsTitle: "Utalási adatok",
        beneficiary: "Kedvezményezett",
        bankName: "Bank neve",
        accountNumber: "Bankszámlaszám",
        iban: "IBAN",
        swift: "SWIFT / BIC",
        copyDetails: "Adatok másolása",
        copied: "Másolva!",
        reference: "Közlemény",
        referenceHint: "Javasolt közlemény: Foglalás – Név – Érkezés dátuma",
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
        acceptTermsRequired:
          "You must accept the Terms and Privacy Policy to book",
        success: "Booking request sent! We'll get back to you soon.",
        error: "An error occurred. Please try again later.",
        offroadOption: "Off-road tour",
        offroadWarning: "Mar 1 – Aug 15: coordination required",

        paymentTitle: "Payment method",
        payOnSite: "Pay on site",
        payByTransfer: "Bank transfer",
        transferNote: "Bank transfer – after confirmation",
        transferDetailsTitle: "Bank transfer details",
        beneficiary: "Beneficiary",
        bankName: "Bank name",
        accountNumber: "Account number",
        iban: "IBAN",
        swift: "SWIFT / BIC",
        copyDetails: "Copy details",
        copied: "Copied!",
        reference: "Reference",
        referenceHint: "Suggested reference: Booking – Name – Check-in date",
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
        acceptTermsRequired:
          "Sie müssen die AGB und Datenschutzerklärung akzeptieren",
        success: "Buchungsanfrage gesendet! Wir melden uns bald bei Ihnen.",
        error:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        offroadOption: "Offroad-Tour",
        offroadWarning: "Mar 1 – Aug 15: Absprache erforderlich",

        paymentTitle: "Zahlungsart",
        payOnSite: "Zahlung vor Ort",
        payByTransfer: "Banküberweisung",
        transferNote: "Überweisung – nach Bestätigung",
        transferDetailsTitle: "Überweisungsdaten",
        beneficiary: "Begünstigter",
        bankName: "Bankname",
        accountNumber: "Kontonummer",
        iban: "IBAN",
        swift: "SWIFT / BIC",
        copyDetails: "Daten kopieren",
        copied: "Kopiert!",
        reference: "Verwendungszweck",
        referenceHint:
          "Empfohlener Verwendungszweck: Buchung – Name – Anreisedatum",
      },
    };

    return dict[lang] || dict.hu; // ✅ HU fallback
  }, [lang]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    message: "",
    acceptTerms: false,
    offroadOption: false,
    paymentMethod: "onsite",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = COPY.required;

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
      if (checkInDate < today) newErrors.checkIn = COPY.invalidDate;
    }

    if (!formData.checkOut) {
      newErrors.checkOut = COPY.required;
    } else if (formData.checkIn) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      if (checkOutDate <= checkInDate) newErrors.checkOut = COPY.invalidDate;
    }

    if (!formData.guests || formData.guests < 1)
      newErrors.guests = COPY.invalidGuests;

    if (!formData.acceptTerms) newErrors.acceptTerms = COPY.acceptTermsRequired;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ fallback copy (ha clipboard permission nincs)
  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  };

  const handleCopy = async () => {
    const base =
      lang === "hu" ? "Foglalás" : lang === "de" ? "Buchung" : "Booking";
    const namePart = formData.name?.trim() || "-";
    const reference = `${base} – ${namePart}${
      formData.checkIn ? ` – ${formData.checkIn}` : ""
    }`;

    const text = [
      `${COPY.transferDetailsTitle}`,
      `${COPY.beneficiary}: ${PAYMENT_DETAILS.beneficiary}`,
      `${COPY.bankName}: ${PAYMENT_DETAILS.bankName}`,
      `${COPY.accountNumber}: ${PAYMENT_DETAILS.accountNumber}`,
      `${COPY.iban}: ${PAYMENT_DETAILS.iban}`,
      `${COPY.swift}: ${PAYMENT_DETAILS.swift}`,
      `${COPY.reference}: ${reference}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      try {
        fallbackCopy(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      } catch {
        setCopied(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: "bermuda-vendeghaz",
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          items: [
            {
              room: room._id || room.id,
              guests: formData.guests,
            },
          ],
          customer: {
            name: formData.name,
            email: formData.email,
            note: formData.message,
          },
          payment: {
            method: formData.paymentMethod, // "onsite" | "transfer"
            transferRequested: formData.paymentMethod === "transfer",
          },
          extras: {
            offroadOption: !!formData.offroadOption,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus({ type: "success", data: result });
        setFormData((prev) => ({
          ...prev,
          name: "",
          email: "",
          checkIn: "",
          checkOut: "",
          guests: 1,
          message: "",
          acceptTerms: false,
          offroadOption: false,
          paymentMethod: "onsite",
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubmitStatus({
          type: "error",
          message: errorData.error || COPY.error,
        });
      }
    } catch {
      setSubmitStatus({ type: "error", message: COPY.error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "guests"
          ? parseInt(value) || 1
          : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  if (submitStatus?.type === "success") {
    const closeLabel =
      lang === "hu" ? "Bezárás" : lang === "de" ? "Schließen" : "Close";

    const codeLine =
      lang === "hu"
        ? `Foglalási kód: ${submitStatus.data.code}`
        : lang === "de"
        ? `Buchungscode: ${submitStatus.data.code}`
        : `Booking code: ${submitStatus.data.code}`;

    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {COPY.success}
        </h3>
        <p className="text-gray-600 mb-6 text-lg">{codeLine}</p>
        <button
          onClick={onClose}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          {closeLabel}
        </button>
      </div>
    );
  }

  const placeholderMsg =
    lang === "hu"
      ? "Esetleges megjegyzések..."
      : lang === "de"
      ? "Besondere Wünsche..."
      : "Any special requests...";

  const base =
    lang === "hu" ? "Foglalás" : lang === "de" ? "Buchung" : "Booking";
  const namePart = formData.name?.trim() || "-";
  const reference = `${base} – ${namePart}${
    formData.checkIn ? ` – ${formData.checkIn}` : ""
  }`;

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
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="name"
          >
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
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="email"
          >
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
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="checkIn"
            >
              {COPY.checkInLabel} *
            </label>
            <input
              id="checkIn"
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
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
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="checkOut"
            >
              {COPY.checkOutLabel} *
            </label>
            <input
              id="checkOut"
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              min={formData.checkIn || new Date().toISOString().split("T")[0]}
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
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="guests"
          >
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
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="message"
          >
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
            placeholder={placeholderMsg}
          />
        </div>

        {/* ✅ Payment method */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">
            {COPY.paymentTitle}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-3 rounded-lg border px-3 py-3 cursor-pointer transition ${
                formData.paymentMethod === "onsite"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="onsite"
                checked={formData.paymentMethod === "onsite"}
                onChange={handleChange}
                className="h-4 w-4 text-emerald-600"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-800">
                {COPY.payOnSite}
              </span>
            </label>

            <label
              className={`flex items-center gap-3 rounded-lg border px-3 py-3 cursor-pointer transition ${
                formData.paymentMethod === "transfer"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="transfer"
                checked={formData.paymentMethod === "transfer"}
                onChange={handleChange}
                className="h-4 w-4 text-emerald-600"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-800">
                {COPY.payByTransfer}
              </span>
            </label>
          </div>

          {formData.paymentMethod === "transfer" && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">{COPY.transferNote}</p>

              <div className="mt-3 rounded-lg bg-white border border-amber-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {COPY.transferDetailsTitle}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 text-sm font-medium rounded-lg px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    {copied ? COPY.copied : COPY.copyDetails}
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="text-gray-500">{COPY.beneficiary}</div>
                    <div className="font-medium text-gray-900 break-words">
                      {PAYMENT_DETAILS.beneficiary}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-500">{COPY.bankName}</div>
                    <div className="font-medium text-gray-900 break-words">
                      {PAYMENT_DETAILS.bankName}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-500">{COPY.accountNumber}</div>
                    <div className="font-medium text-gray-900 break-all">
                      {PAYMENT_DETAILS.accountNumber}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-500">{COPY.iban}</div>
                    <div className="font-medium text-gray-900 break-all">
                      {PAYMENT_DETAILS.iban}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-500">{COPY.swift}</div>
                    <div className="font-medium text-gray-900 break-all">
                      {PAYMENT_DETAILS.swift}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-500">{COPY.reference}</div>
                    <div className="font-medium text-gray-900 break-words">
                      {reference}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-600">
                  {COPY.referenceHint}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Offroad option */}
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
            <label
              htmlFor="offroadOption"
              className="ml-3 text-sm text-gray-700 leading-relaxed"
            >
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

        {/* Accept terms */}
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
            <label
              htmlFor="acceptTerms"
              className="ml-3 text-sm text-gray-700 leading-relaxed"
            >
              {lang === "hu"
                ? "Elolvastam és elfogadom az "
                : lang === "de"
                ? "Ich habe die "
                : "I have read and accept the "}
              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {lang === "hu"
                  ? "Adatkezelési tájékoztatót"
                  : lang === "de"
                  ? "Datenschutzerklärung"
                  : "Privacy Policy"}
              </Link>
              {lang === "hu"
                ? " és az "
                : lang === "de"
                ? " und die "
                : " and the "}
              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {lang === "hu"
                  ? "Általános Szerződési Feltételeket"
                  : lang === "de"
                  ? "AGB"
                  : "Terms and Conditions"}
              </Link>
              .
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
          )}
        </div>

        {/* Buttons */}
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
            {isSubmitting
              ? lang === "hu"
                ? "Küldés..."
                : lang === "de"
                ? "Senden..."
                : "Sending..."
              : COPY.submitButton}
          </button>
        </div>
      </form>
    </>
  );
};

export default BookingForm;
