import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

// ── API base URL (same pattern as useRooms / useAdminAuth) ────
const RAW_API = import.meta.env.VITE_API_URL;

function resolveBase() {
  try {
    const u = new URL(RAW_API || window.location.origin);
    if (
      (u.hostname === "localhost" || u.hostname === "127.0.0.1") &&
      window.location.hostname
    ) {
      u.hostname = window.location.hostname;
    }
    return u.origin;
  } catch {
    return RAW_API || window.location.origin;
  }
}

// ── Payment details ────────────────────────────────────────
const PAYMENT_DETAILS = {
  beneficiary: "Bermuda Vendégház",
  bankName: "MBH Bank Nyrt.",
  accountNumber: "50466113-10001356-00000000",
  iban: "HU89 5046 6113 1000 1356 0000 0000",
  swift: "MKKBHUHB",
};

// ── Date helpers ───────────────────────────────────────────
const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const isSameDay = (a, b) => a && b && toDateStr(a) === toDateStr(b);
const isInRange = (day, start, end) => {
  if (!start || !end) return false;
  const d = day.getTime();
  const s = Math.min(start.getTime(), end.getTime());
  const e = Math.max(start.getTime(), end.getTime());
  return d >= s && d <= e;
};
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfWeek = (year, month) => {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
};
const daysBetween = (a, b) =>
  Math.round(Math.abs(b.getTime() - a.getTime()) / 86400000);

const HU_MONTHS = ["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"];
const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DE_MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DAY_HEADERS = {
  hu: ["H", "K", "Sze", "Cs", "P", "Szo", "V"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
};

const formatDisplayDate = (d, lang) => {
  if (!d) return "–";
  const months = lang === "de" ? DE_MONTHS : lang === "en" ? EN_MONTHS : HU_MONTHS;
  return `${d.getFullYear()}. ${months[d.getMonth()].toLowerCase()} ${d.getDate()}.`;
};
const formatPrice = (n) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft";

// ── Calendar Month ─────────────────────────────────────────
function CalendarMonth({ year, month, lang, bookedSet, startDate, endDate, hoverDate, onDayClick, onDayHover, selecting }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const months = lang === "de" ? DE_MONTHS : lang === "en" ? EN_MONTHS : HU_MONTHS;
  const dayHeaders = DAY_HEADERS[lang] || DAY_HEADERS.hu;
  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`e-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = toDateStr(date);
    const isBooked = bookedSet.has(dateStr);
    const isPast = date < today;
    const isDisabled = isBooked || isPast;
    const isStart = isSameDay(date, startDate);
    const isEnd = isSameDay(date, endDate);
    const effectiveEnd = selecting && hoverDate ? hoverDate : endDate;
    const inRange = isInRange(date, startDate, effectiveEnd) && !isStart && !isEnd;
    const isHoverEnd = selecting && isSameDay(date, hoverDate) && !isStart;

    let hoverConflict = false;
    if (selecting && hoverDate && startDate && !isDisabled) {
      const lo = new Date(Math.min(startDate, hoverDate));
      const hi = new Date(Math.max(startDate, hoverDate));
      const cur = new Date(lo);
      while (cur <= hi) {
        if (bookedSet.has(toDateStr(cur))) { hoverConflict = true; break; }
        cur.setDate(cur.getDate() + 1);
      }
    }

    let cls = "relative aspect-square flex items-center justify-center text-sm rounded-md transition-all duration-100 select-none ";
    if (isBooked) cls += "bg-red-100 text-red-500 cursor-not-allowed line-through font-medium ";
    else if (isPast) cls += "text-gray-300 cursor-not-allowed ";
    else if (isStart || isEnd || isHoverEnd) cls += "bg-green-600 text-white font-semibold cursor-pointer shadow-sm ";
    else if (inRange && !hoverConflict) cls += "bg-green-50 text-green-800 cursor-pointer ";
    else cls += "text-gray-700 cursor-pointer hover:bg-gray-100 ";

    cells.push(
      <div key={day} className={cls}
        onClick={() => !isDisabled && onDayClick(date)}
        onMouseEnter={() => !isDisabled && onDayHover(date)}
        onMouseLeave={() => onDayHover(null)}
        title={isBooked ? (lang === "hu" ? "Foglalt" : lang === "de" ? "Belegt" : "Booked") : undefined}
      >
        {day}
        {isBooked && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <h4 className="text-center text-sm font-semibold text-gray-800 mb-3">{months[month]} {year}</h4>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayHeaders.map((d) => (<div key={d} className="aspect-square flex items-center justify-center text-xs font-medium text-gray-400">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">{cells}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ██  BookingForm  ██
// ════════════════════════════════════════════════════════════
const BookingForm = ({ room, onClose, bookedDates: bookedDatesProp }) => {
  const { t, lang } = useI18n();

  const COPY = useMemo(() => {
    const dict = {
      hu: {
        title: "Foglalás", roomLabel: "Szoba", nameLabel: "Név", emailLabel: "Email",
        phoneLabel: "Telefonszám", invalidPhone: "Érvényes telefonszámot adj meg",
        checkInLabel: "Érkezés", checkOutLabel: "Távozás", guestsLabel: "Vendégek száma",
        messageLabel: "Üzenet (opcionális)", submitButton: "Foglalási igény elküldése",
        cancelButton: "Mégsem", required: "Kötelező mező",
        invalidEmail: "Érvényes email címet adj meg", invalidDate: "Érvényes dátumot adj meg",
        invalidGuests: "Legalább 1 vendég szükséges",
        guestsOverCapacity: (max) => `Legfeljebb ${max} vendég fér el ebben a szobában`,
        acceptTermsRequired: "A foglaláshoz el kell fogadni az ÁSZF-t és adatkezelési tájékoztatót",
        success: "Foglalási igény elküldve! Hamarosan visszajelzünk.",
        error: "Hiba történt. Kérjük, próbáld újra később.",
        offroadOption: "Off-road túra",
        offroadWarning: "Márc. 1 – Aug. 15 között egyeztetés kötelező",
        offroadPriceNote: "Az offroad túra ára nem része az alap szállásdíjnak.",
        paymentTitle: "Fizetési mód", payOnSite: "Fizetés a helyszínen",
        payByTransfer: "Banki előreutalás", transferNote: "Előreutalás – a visszaigazolás után",
        transferDetailsTitle: "Utalási adatok", beneficiary: "Kedvezményezett",
        bankName: "Bank neve", accountNumber: "Bankszámlaszám", iban: "IBAN",
        swift: "SWIFT / BIC", copyDetails: "Adatok másolása", copied: "Másolva!",
        reference: "Közlemény", referenceHint: "Javasolt közlemény: Foglalás – Név – Érkezés dátuma",
        calendarTitle: "Válassz időszakot", selectCheckOut: "Kattints a távozás napjára",
        nights: "éjszaka", persons: "fő", pricePerNight: "/ fő / éj", totalPrice: "Összesen",
        promoNights: "akciós éjszaka", normalNights: "normál éjszaka", promoBadge: "Akció",
        childFreeNote: "6 éves kor alatt a szállás ingyenes.", petOption: "Háziállatot hozunk",
        petSurcharge: "Állatbarát szálláshely: háziállat felár 2 000 Ft/éj. Kérjük, érkezés előtt jelezze.",
        petNights: "háziállat felár", bookedLabel: "Foglalt", selectedLabel: "Kijelölt",
        datesRequired: "Kérjük, válassz érkezési és távozási dátumot a naptárban",
        rangeConflict: "A kijelölt időszak foglalt napokat tartalmaz",
      },
      en: {
        title: "Booking", roomLabel: "Room", nameLabel: "Name", emailLabel: "Email",
        phoneLabel: "Phone number", invalidPhone: "Please enter a valid phone number",
        checkInLabel: "Check-in", checkOutLabel: "Check-out", guestsLabel: "Number of Guests",
        messageLabel: "Message (optional)", submitButton: "Send Booking Request",
        cancelButton: "Cancel", required: "Required field",
        invalidEmail: "Please enter a valid email", invalidDate: "Please enter a valid date",
        invalidGuests: "At least 1 guest is required",
        guestsOverCapacity: (max) => `Maximum ${max} guests are allowed for this room`,
        acceptTermsRequired: "You must accept the Terms and Privacy Policy to book",
        success: "Booking request sent! We'll get back to you soon.",
        error: "An error occurred. Please try again later.",
        offroadOption: "Off-road tour",
        offroadWarning: "Mar 1 – Aug 15: coordination required",
        offroadPriceNote: "The off-road tour is not included in the accommodation price.",
        paymentTitle: "Payment method", payOnSite: "Pay on site",
        payByTransfer: "Bank transfer", transferNote: "Bank transfer – after confirmation",
        transferDetailsTitle: "Bank transfer details", beneficiary: "Beneficiary",
        bankName: "Bank name", accountNumber: "Account number", iban: "IBAN",
        swift: "SWIFT / BIC", copyDetails: "Copy details", copied: "Copied!",
        reference: "Reference", referenceHint: "Suggested reference: Booking – Name – Check-in date",
        calendarTitle: "Select dates", selectCheckOut: "Click the check-out date",
        nights: "nights", persons: "persons", pricePerNight: "/ person / night", totalPrice: "Total",
        promoNights: "discounted nights", normalNights: "regular nights", promoBadge: "Deal",
        childFreeNote: "Accommodation is free for children under 6.", petOption: "We're bringing a pet",
        petSurcharge: "Pet-friendly accommodation: pet surcharge 2 000 Ft/night. Please let us know before arrival.",
        petNights: "pet surcharge", bookedLabel: "Booked", selectedLabel: "Selected",
        datesRequired: "Please select check-in and check-out dates on the calendar",
        rangeConflict: "Selected range contains booked dates",
      },
      de: {
        title: "Buchung", roomLabel: "Zimmer", nameLabel: "Name", emailLabel: "Email",
        phoneLabel: "Telefonnummer", invalidPhone: "Bitte gültige Telefonnummer eingeben",
        checkInLabel: "Anreise", checkOutLabel: "Abreise", guestsLabel: "Anzahl der Gäste",
        messageLabel: "Nachricht (optional)", submitButton: "Buchungsanfrage senden",
        cancelButton: "Abbrechen", required: "Pflichtfeld",
        invalidEmail: "Bitte gültige Email eingeben", invalidDate: "Bitte gültiges Datum eingeben",
        invalidGuests: "Mindestens 1 Gast erforderlich",
        guestsOverCapacity: (max) => `Maximal ${max} Gäste sind in diesem Zimmer möglich`,
        acceptTermsRequired: "Sie müssen die AGB und Datenschutzerklärung akzeptieren",
        success: "Buchungsanfrage gesendet! Wir melden uns bald bei Ihnen.",
        error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        offroadOption: "Offroad-Tour",
        offroadWarning: "März 1 – Aug. 15: Absprache erforderlich",
        offroadPriceNote: "Die Offroad-Tour ist nicht im Übernachtungspreis enthalten.",
        paymentTitle: "Zahlungsart", payOnSite: "Zahlung vor Ort",
        payByTransfer: "Banküberweisung", transferNote: "Überweisung – nach Bestätigung",
        transferDetailsTitle: "Überweisungsdaten", beneficiary: "Begünstigter",
        bankName: "Bankname", accountNumber: "Kontonummer", iban: "IBAN",
        swift: "SWIFT / BIC", copyDetails: "Daten kopieren", copied: "Kopiert!",
        reference: "Verwendungszweck", referenceHint: "Empfohlener Verwendungszweck: Buchung – Name – Anreisedatum",
        calendarTitle: "Zeitraum wählen", selectCheckOut: "Klicken Sie auf das Abreisedatum",
        nights: "Nächte", persons: "Personen", pricePerNight: "/ Person / Nacht", totalPrice: "Gesamt",
        promoNights: "Aktionsnächte", normalNights: "reguläre Nächte", promoBadge: "Aktion",
        childFreeNote: "Unterkunft für Kinder unter 6 Jahren kostenlos.", petOption: "Wir bringen ein Haustier mit",
        petSurcharge: "Haustierfreundliche Unterkunft: Haustierzuschlag 2 000 Ft/Nacht. Bitte vor Anreise mitteilen.",
        petNights: "Haustierzuschlag", bookedLabel: "Belegt", selectedLabel: "Ausgewählt",
        datesRequired: "Bitte wählen Sie An- und Abreisedatum im Kalender",
        rangeConflict: "Der gewählte Zeitraum enthält belegte Tage",
      },
    };
    return dict[lang] || dict.hu;
  }, [lang]);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", guests: "", message: "",
    acceptTerms: false, offroadOption: false, petOption: false, paymentMethod: "onsite",
  });
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [bookedDates, setBookedDates] = useState(bookedDatesProp || []);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const maxGuests = Number(room?.capacity || room?.guests || 10);

  const priceUnit = room?.price?.unit || "person_night";
  const basePrice = Number(room?.price?.amount || room?.pricePerNight || room?.basePricePerPerson || 0);
  const promo = room?.price?.promo;
  const promoEnabled = promo?.enabled && typeof promo?.amount === "number";
  const promoPrice = promoEnabled ? Number(promo.amount) : basePrice;
  const promoStart = promo?.startAt ? new Date(promo.startAt) : null;
  const promoEnd = promo?.endAt ? new Date(promo.endAt) : null;

  const isPromoNight = useCallback((date) => {
    if (!promoEnabled || !promoStart || !promoEnd) return false;
    const d = new Date(date); d.setHours(0,0,0,0);
    const s = new Date(promoStart); s.setHours(0,0,0,0);
    const e = new Date(promoEnd); e.setHours(0,0,0,0);
    return d >= s && d <= e;
  }, [promoEnabled, promoStart, promoEnd]);

  const now_ = new Date(); now_.setHours(0,0,0,0);
  const promoActiveNow = promoEnabled && promoStart && promoEnd &&
    now_ >= new Date(new Date(promoStart).setHours(0,0,0,0)) &&
    now_ <= new Date(new Date(promoEnd).setHours(0,0,0,0));

  useEffect(() => {
    if (bookedDatesProp) { setBookedDates(bookedDatesProp); return; }
    const roomId = room?._id || room?.id;
    if (!roomId) return;
    let cancelled = false;
    const fetchBooked = async () => {
      try {
        const res = await fetch(`${resolveBase()}/api/bookings/booked-dates?room=${roomId}&months=6`);
        if (res.ok) { const data = await res.json(); if (!cancelled) setBookedDates(data.dates || []); }
      } catch { /* silent */ }
    };
    fetchBooked();
    return () => { cancelled = true; };
  }, [room, bookedDatesProp]);

  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const goToPrevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
  const goToNextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };

  const rangeHasConflict = useCallback((start, end) => {
    if (!start || !end) return false;
    const s = new Date(Math.min(start, end));
    const e = new Date(Math.max(start, end));
    const d = new Date(s);
    while (d <= e) { if (bookedSet.has(toDateStr(d))) return true; d.setDate(d.getDate() + 1); }
    return false;
  }, [bookedSet]);

  const handleDayClick = (date) => {
    if (!selecting) {
      setCheckInDate(date); setCheckOutDate(null); setSelecting(true);
      setErrors((prev) => ({ ...prev, checkIn: null, checkOut: null }));
    } else {
      if (isSameDay(date, checkInDate)) { setSelecting(false); setCheckInDate(null); return; }
      const realStart = date < checkInDate ? date : checkInDate;
      const realEnd = date < checkInDate ? checkInDate : date;
      if (rangeHasConflict(realStart, realEnd)) { setCheckInDate(date); setCheckOutDate(null); return; }
      setCheckInDate(realStart); setCheckOutDate(realEnd); setSelecting(false);
      setErrors((prev) => ({ ...prev, checkIn: null, checkOut: null }));
    }
  };

  const nights = checkInDate && checkOutDate ? daysBetween(checkInDate, checkOutDate) : 0;
  const guestsNum = Number(formData.guests) || 0;

  const priceBreakdown = useMemo(() => {
    if (!nights || !checkInDate || !checkOutDate) return { promoNights: 0, normalNights: 0, total: 0 };
    let pN = 0, nN = 0;
    const d = new Date(checkInDate); d.setHours(0,0,0,0);
    for (let i = 0; i < nights; i++) { if (isPromoNight(d)) pN++; else nN++; d.setDate(d.getDate() + 1); }
    const multiplier = priceUnit === "person_night" ? guestsNum : 1;
    return { promoNights: pN, normalNights: nN, total: (pN * promoPrice + nN * basePrice) * multiplier };
  }, [nights, checkInDate, checkOutDate, isPromoNight, promoPrice, basePrice, priceUnit, guestsNum]);

  const PET_SURCHARGE_PER_NIGHT = 2000;
  const petSurcharge = formData.petOption && nights > 0 ? nights * PET_SURCHARGE_PER_NIGHT : 0;
  const totalPrice = priceBreakdown.total + petSurcharge;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = COPY.required;
    if (!formData.email.trim()) { newErrors.email = COPY.required; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) { newErrors.email = COPY.invalidEmail; }
    // Phone – required, min 6 digits
    const phoneClean = formData.phone.replace(/[\s\-\(\)]/g, "");
    if (!formData.phone.trim()) { newErrors.phone = COPY.required; }
    else if (!/^\+?[\d]{6,15}$/.test(phoneClean)) { newErrors.phone = COPY.invalidPhone; }
    if (!checkInDate || !checkOutDate) newErrors.checkIn = COPY.datesRequired;
    const g = Number(formData.guests);
    if (!formData.guests || !Number.isFinite(g) || g < 1) { newErrors.guests = COPY.invalidGuests; }
    else if (g > maxGuests) { newErrors.guests = COPY.guestsOverCapacity ? COPY.guestsOverCapacity(maxGuests) : `Max ${maxGuests}`; }
    if (!formData.acceptTerms) newErrors.acceptTerms = COPY.acceptTermsRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "absolute"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
  };
  const handleCopy = async () => {
    const base = lang === "hu" ? "Foglalás" : lang === "de" ? "Buchung" : "Booking";
    const namePart = formData.name?.trim() || "-";
    const reference = `${base} – ${namePart}${checkInDate ? ` – ${toDateStr(checkInDate)}` : ""}`;
    const text = [
      `${COPY.transferDetailsTitle}`, `${COPY.beneficiary}: ${PAYMENT_DETAILS.beneficiary}`,
      `${COPY.bankName}: ${PAYMENT_DETAILS.bankName}`, `${COPY.accountNumber}: ${PAYMENT_DETAILS.accountNumber}`,
      `${COPY.iban}: ${PAYMENT_DETAILS.iban}`, `${COPY.swift}: ${PAYMENT_DETAILS.swift}`,
      `${COPY.reference}: ${reference}`,
    ].join("\n");
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1400); }
    catch { try { fallbackCopy(text); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { setCopied(false); } }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true); setSubmitStatus(null);
    try {
      const response = await fetch(`${resolveBase()}/api/bookings`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: "bermuda-vendeghaz",
          checkIn: toDateStr(checkInDate), checkOut: toDateStr(checkOutDate),
          items: [{ room: room._id || room.id, guests: Number(formData.guests) }],
          customer: { name: formData.name, email: formData.email, phone: formData.phone, note: formData.message, lang },
          payment: { method: formData.paymentMethod, transferRequested: formData.paymentMethod === "transfer" },
          extras: { offroadOption: !!formData.offroadOption, petOption: !!formData.petOption },
          calculated: { nights, persons: guestsNum, basePrice,
            promoPrice: priceBreakdown.promoNights > 0 ? promoPrice : null,
            promoNights: priceBreakdown.promoNights, normalNights: priceBreakdown.normalNights,
            petSurcharge, totalPrice },
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setSubmitStatus({ type: "success", data: result });
        setFormData({ name: "", email: "", phone: "", guests: "", message: "", acceptTerms: false, offroadOption: false, petOption: false, paymentMethod: "onsite" });
        setCheckInDate(null); setCheckOutDate(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubmitStatus({ type: "error", message: errorData.message || COPY.error });
      }
    } catch { setSubmitStatus({ type: "error", message: COPY.error }); }
    finally { setIsSubmitting(false); }
  };

  const blockNonDigitsKeyDown = (e) => {
    const allowed = ["Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","Home","End"];
    if (allowed.includes(e.key)) return;
    if ((e.ctrlKey || e.metaKey) && ["a","c","v","x"].includes(e.key.toLowerCase())) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };
  const handleGuestsPaste = (e) => { const text = e.clipboardData?.getData("text") ?? ""; if (!/^\d+$/.test(text.trim())) e.preventDefault(); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked
        : name === "guests" ? (() => {
            if (value === "") return "";
            const cleaned = String(value).replace(/[^\d]/g, "");
            if (cleaned === "") return "";
            const n = Number(cleaned);
            if (!Number.isFinite(n)) return "";
            return String(Math.min(Math.max(n, 1), maxGuests));
          })()
        : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  if (submitStatus?.type === "success") {
    const closeLabel = lang === "hu" ? "Bezárás" : lang === "de" ? "Schließen" : "Close";
    const codeLine = lang === "hu" ? `Foglalási kód: ${submitStatus.data.code}` : lang === "de" ? `Buchungscode: ${submitStatus.data.code}` : `Booking code: ${submitStatus.data.code}`;
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{COPY.success}</h3>
        <p className="text-gray-600 mb-6 text-lg">{codeLine}</p>
        <button onClick={onClose} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">{closeLabel}</button>
      </div>
    );
  }

  const base = lang === "hu" ? "Foglalás" : lang === "de" ? "Buchung" : "Booking";
  const namePart = formData.name?.trim() || "-";
  const reference = `${base} – ${namePart}${checkInDate ? ` – ${toDateStr(checkInDate)}` : ""}`;
  const placeholderMsg = lang === "hu" ? "Esetleges megjegyzések..." : lang === "de" ? "Besondere Wünsche..." : "Any special requests...";

  return (
    <>
      {/* Room Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-1">{COPY.roomLabel}</label>
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium text-gray-900">{room.name}</div>
          {basePrice > 0 && (
            <div className="text-sm text-gray-500">
              {promoActiveNow && (<><span className="line-through text-gray-400 mr-2">{formatPrice(basePrice)}</span><span className="inline-block text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full mr-1">{COPY.promoBadge}</span></>)}
              <span className="font-semibold text-gray-800">{formatPrice(promoActiveNow ? promoPrice : basePrice)}</span>{" "}{COPY.pricePerNight}
            </div>
          )}
        </div>
      </div>

      {/* CALENDAR */}
      <div className="mb-6 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">{COPY.calendarTitle}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-300" />{COPY.bookedLabel}</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-600" />{COPY.selectedLabel}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={goToPrevMonth} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">‹</button>
          <button type="button" onClick={goToNextMonth} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">›</button>
        </div>
        {selecting && (<div className="mb-3 px-3 py-2 rounded-md bg-green-50 border border-green-200 text-center"><p className="text-xs text-green-700">{COPY.selectCheckOut}</p></div>)}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CalendarMonth year={viewYear} month={viewMonth} lang={lang} bookedSet={bookedSet} startDate={checkInDate} endDate={checkOutDate} hoverDate={hoverDate} onDayClick={handleDayClick} onDayHover={setHoverDate} selecting={selecting} />
          <CalendarMonth year={nextMonthYear} month={nextMonth} lang={lang} bookedSet={bookedSet} startDate={checkInDate} endDate={checkOutDate} hoverDate={hoverDate} onDayClick={handleDayClick} onDayHover={setHoverDate} selecting={selecting} />
        </div>
        {checkInDate && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <div><span className="text-gray-500">{COPY.checkInLabel}: </span><span className="font-medium text-gray-900">{formatDisplayDate(checkInDate, lang)}</span></div>
              {checkOutDate && (<div><span className="text-gray-500">{COPY.checkOutLabel}: </span><span className="font-medium text-gray-900">{formatDisplayDate(checkOutDate, lang)}</span></div>)}
            </div>
          </div>
        )}
        {errors.checkIn && <p className="mt-2 text-sm text-red-600">{errors.checkIn}</p>}
      </div>

      {/* PRICE SUMMARY */}
      {nights > 0 && basePrice > 0 && guestsNum > 0 && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="space-y-1 text-sm text-gray-700 mb-3">
            {priceBreakdown.promoNights > 0 && (
              <div className="flex items-center justify-between">
                <span>{priceUnit === "person_night" && <>{guestsNum} {COPY.persons} × </>}{priceBreakdown.promoNights} {COPY.promoNights} × {formatPrice(promoPrice)}</span>
                <span className="font-medium text-green-700">{formatPrice(priceBreakdown.promoNights * promoPrice * (priceUnit === "person_night" ? guestsNum : 1))}</span>
              </div>
            )}
            {priceBreakdown.normalNights > 0 && (
              <div className="flex items-center justify-between">
                <span>{priceUnit === "person_night" && <>{guestsNum} {COPY.persons} × </>}{priceBreakdown.normalNights} {priceBreakdown.promoNights > 0 ? COPY.normalNights : COPY.nights} × {formatPrice(basePrice)}</span>
                <span className="font-medium">{formatPrice(priceBreakdown.normalNights * basePrice * (priceUnit === "person_night" ? guestsNum : 1))}</span>
              </div>
            )}
            {petSurcharge > 0 && (
              <div className="flex items-center justify-between">
                <span>🐾 {nights} {COPY.nights} × {formatPrice(PET_SURCHARGE_PER_NIGHT)} ({COPY.petNights})</span>
                <span className="font-medium">{formatPrice(petSurcharge)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-green-200 pt-2">
            <span className="text-sm font-semibold text-gray-900">{COPY.totalPrice}</span>
            <span className="text-xl font-bold text-green-700">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      )}

      {/* FORM FIELDS */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">{COPY.nameLabel} *</label>
          <input id="name" type="text" name="name" value={formData.name} onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${errors.name ? "border-red-500" : "border-gray-300"}`}
            disabled={isSubmitting} required />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">{COPY.emailLabel} *</label>
          <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${errors.email ? "border-red-500" : "border-gray-300"}`}
            disabled={isSubmitting} required />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Phone – required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">{COPY.phoneLabel} *</label>
          <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange}
            placeholder="+36 30 123 4567"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${errors.phone ? "border-red-500" : "border-gray-300"}`}
            disabled={isSubmitting} required />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="guests">{COPY.guestsLabel} *</label>
          <input id="guests" type="text" inputMode="numeric" pattern="[0-9]*" name="guests" value={formData.guests}
            onChange={handleChange} onKeyDown={blockNonDigitsKeyDown} onPaste={handleGuestsPaste} min="1" max={maxGuests}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${errors.guests ? "border-red-500" : "border-gray-300"}`}
            disabled={isSubmitting} required />
          {errors.guests && <p className="mt-1 text-sm text-red-600">{errors.guests}</p>}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">{COPY.messageLabel}</label>
          <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors resize-none"
            disabled={isSubmitting} placeholder={placeholderMsg} />
        </div>

        {/* Child-free + Pet */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-sm text-gray-600 flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">👶</span>{COPY.childFreeNote}
          </p>
          <div className="border-t border-gray-200 pt-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="petOption" checked={formData.petOption} onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" disabled={isSubmitting} />
              <div>
                <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5"><span className="text-base">🐾</span>{COPY.petOption}</span>
                <p className="text-xs text-gray-500 mt-1">{COPY.petSurcharge}</p>
              </div>
            </label>
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">{COPY.paymentTitle}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className={`flex items-center gap-3 rounded-lg border px-3 py-3 cursor-pointer transition ${formData.paymentMethod === "onsite" ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"}`}>
              <input type="radio" name="paymentMethod" value="onsite" checked={formData.paymentMethod === "onsite"} onChange={handleChange} className="h-4 w-4 text-emerald-600" disabled={isSubmitting} />
              <span className="text-sm font-medium text-gray-800">{COPY.payOnSite}</span>
            </label>
            <label className={`flex items-center gap-3 rounded-lg border px-3 py-3 cursor-pointer transition ${formData.paymentMethod === "transfer" ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"}`}>
              <input type="radio" name="paymentMethod" value="transfer" checked={formData.paymentMethod === "transfer"} onChange={handleChange} className="h-4 w-4 text-emerald-600" disabled={isSubmitting} />
              <span className="text-sm font-medium text-gray-800">{COPY.payByTransfer}</span>
            </label>
          </div>
          {formData.paymentMethod === "transfer" && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">{COPY.transferNote}</p>
              <div className="mt-3 rounded-lg bg-white border border-amber-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-900">{COPY.transferDetailsTitle}</div>
                  <button type="button" onClick={handleCopy} className="shrink-0 text-sm font-medium rounded-lg px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition">
                    {copied ? COPY.copied : COPY.copyDetails}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="min-w-0"><div className="text-gray-500">{COPY.beneficiary}</div><div className="font-medium text-gray-900 break-words">{PAYMENT_DETAILS.beneficiary}</div></div>
                  <div className="min-w-0"><div className="text-gray-500">{COPY.bankName}</div><div className="font-medium text-gray-900 break-words">{PAYMENT_DETAILS.bankName}</div></div>
                  <div className="min-w-0"><div className="text-gray-500">{COPY.accountNumber}</div><div className="font-medium text-gray-900 break-all">{PAYMENT_DETAILS.accountNumber}</div></div>
                  <div className="min-w-0"><div className="text-gray-500">{COPY.iban}</div><div className="font-medium text-gray-900 break-all">{PAYMENT_DETAILS.iban}</div></div>
                  <div className="min-w-0"><div className="text-gray-500">{COPY.swift}</div><div className="font-medium text-gray-900 break-all">{PAYMENT_DETAILS.swift}</div></div>
                  <div className="min-w-0"><div className="text-gray-500">{COPY.reference}</div><div className="font-medium text-gray-900 break-words">{reference}</div></div>
                </div>
                <p className="mt-3 text-xs text-gray-600">{COPY.referenceHint}</p>
              </div>
            </div>
          )}
        </div>

        {/* Offroad option */}
        <div>
          <div className="flex items-start">
            <input id="offroadOption" type="checkbox" name="offroadOption" checked={formData.offroadOption} onChange={handleChange}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" disabled={isSubmitting} />
            <label htmlFor="offroadOption" className="ml-3 text-sm text-gray-700 leading-relaxed">
              {t("booking.offroad.option") || COPY.offroadOption}
            </label>
          </div>
          {formData.offroadOption && (
            <div className="mt-2 ml-7 p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
              <p className="text-sm text-amber-800 break-words">{COPY.offroadWarning}</p>
              <p className="text-sm font-medium text-amber-900 break-words">{COPY.offroadPriceNote}</p>
            </div>
          )}
        </div>

        {/* Accept terms */}
        <div>
          <div className="flex items-start">
            <input id="acceptTerms" type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange}
              className={`mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ${errors.acceptTerms ? "border-red-500" : ""}`} disabled={isSubmitting} />
            <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-700 leading-relaxed">
              {lang === "hu" ? "Elolvastam és elfogadom az " : lang === "de" ? "Ich habe die " : "I have read and accept the "}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:text-green-800 underline font-medium" onClick={(e) => e.stopPropagation()}>
                {lang === "hu" ? "Adatkezelési tájékoztatót" : lang === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
              </Link>
              {lang === "hu" ? " és az " : lang === "de" ? " und die " : " and the "}
              <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:text-green-800 underline font-medium" onClick={(e) => e.stopPropagation()}>
                {lang === "hu" ? "Általános Szerződési Feltételeket" : lang === "de" ? "AGB" : "Terms and Conditions"}
              </Link>.
            </label>
          </div>
          {errors.acceptTerms && <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>}
        </div>

        {submitStatus?.type === "error" && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{submitStatus.message}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}>{COPY.cancelButton}</button>
          <button type="submit"
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-green-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}>
            {isSubmitting ? (lang === "hu" ? "Küldés..." : lang === "de" ? "Senden..." : "Sending...")
              : nights > 0 && basePrice > 0 && guestsNum > 0
              ? `${COPY.submitButton} – ${formatPrice(totalPrice)}`
              : COPY.submitButton}
          </button>
        </div>
      </form>
    </>
  );
};

export default BookingForm;