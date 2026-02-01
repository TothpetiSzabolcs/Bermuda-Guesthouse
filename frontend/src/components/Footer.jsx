import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const FB_URL = "https://www.facebook.com/profile.php?id=61560409597180#";

const scrollToTop = () => {
  // kis timeout, hogy route váltás után is biztosan felmenjen
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
};

const Footer = () => {
  const { lang } = useI18n();

  const copy = {
    hu: {
      about:
        "Kényelmes szállás a Balaton közelében. Modern felszereltség, barátságos környezet, felejthetetlen élmények.",
      addressLabel: "Cím:",
      phoneLabel: "Telefon:",
      emailLabel: "Email:",
      ntakLabel: "NTAK Szám:",
      quick: "Gyors linkek",
      legal: "Jogi információk",
      social: "Kövess minket",
      home: "Főoldal",
      rooms: "Szobák",
      experiences: "Élmények",
      gallery: "Galéria",
      contact: "Kapcsolat",
      privacy: "Adatkezelési tájékoztató",
      terms: "ÁSZF és lemondási feltételek",
      rights: "Minden jog fenntartva.",
      igSoon: "Instagram (hamarosan)",
      socialHint: "Kövess minket a friss képekért és hírekért.",
    },
    en: {
      about:
        "Comfortable accommodation near Lake Balaton. Modern amenities, friendly atmosphere, unforgettable experiences.",
      addressLabel: "Address:",
      phoneLabel: "Phone:",
      emailLabel: "Email:",
      ntakLabel: "NTAK Number:",
      quick: "Quick Links",
      legal: "Legal Information",
      social: "Follow us",
      home: "Home",
      rooms: "Rooms",
      experiences: "Experiences",
      gallery: "Gallery",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms and Cancellation Policy",
      rights: "All rights reserved.",
      igSoon: "Instagram (soon)",
      socialHint: "Follow us for updates and photos.",
    },
    de: {
      about:
        "Bequeme Unterkunft nahe dem Balaton. Moderne Ausstattung, freundliche Atmosphäre, unvergessliche Erlebnisse.",
      addressLabel: "Adresse:",
      phoneLabel: "Telefon:",
      emailLabel: "Email:",
      ntakLabel: "NTAK Nummer:",
      quick: "Schnelle Links",
      legal: "Rechtliche Informationen",
      social: "Folge uns",
      home: "Startseite",
      rooms: "Zimmer",
      experiences: "Erlebnisse",
      gallery: "Galerie",
      contact: "Kontakt",
      privacy: "Datenschutzerklärung",
      terms: "AGB und Stornobedingungen",
      rights: "Alle Rechte vorbehalten.",
      igSoon: "Instagram (bald)",
      socialHint: "Folge uns für Updates und Fotos.",
    },
  }[lang];

  const aboutText =
    lang === "hu" ? (
      <>
        Kényelmes szállás a Balaton közelében. Modern felszereltség, barátságos
        {"\u00A0"}
        környezet, felejthetetlen élmények.
      </>
    ) : (
      copy.about
    );

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Company */}
          <div className="sm:col-span-2 lg:col-span-5">
            <h3 className="text-white font-semibold text-lg tracking-tight">
              Bermuda Vendégház
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              {aboutText}
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-semibold text-gray-200 flex-shrink-0 min-w-[70px]">
                  {copy.addressLabel}
                </span>
                <span className="break-words text-gray-400">
                  Somogy megye, Vése Zrínyi utca 1.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-semibold text-gray-200 flex-shrink-0 min-w-[70px]">
                  {copy.phoneLabel}
                </span>
                <a
                  href="tel:+36302615608"
                  className="text-gray-300 hover:text-emerald-300 transition-colors break-words"
                >
                  06/30 261 5608
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-semibold text-gray-200 flex-shrink-0 min-w-[70px]">
                  {copy.emailLabel}
                </span>
                <a
                  href="mailto:bermudavendeghazvese@gmail.com"
                  className="text-gray-300 hover:text-emerald-300 transition-colors break-all"
                >
                  bermudavendeghazvese@gmail.com
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-semibold text-gray-200 flex-shrink-0 min-w-[70px]">
                  {copy.ntakLabel}
                </span>
                <span className="break-words text-gray-400">MA24095212</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold text-base mb-4">
              {copy.quick}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  onClick={scrollToTop}
                  className="text-gray-300 hover:text-emerald-300 transition-colors block py-1"
                >
                  {copy.home}
                </Link>
              </li>
              <li>
                <Link
                  to="/#rooms"
                  className="text-gray-300 hover:text-emerald-300 transition-colors block py-1"
                >
                  {copy.rooms}
                </Link>
              </li>

              <li>
                <Link
                  to="/#experiences"
                  className="text-gray-300 hover:text-emerald-300 transition-colors block py-1"
                >
                  {copy.experiences}
                </Link>
              </li>

              <li>
                <Link
                  to="/gallery"
                  className="text-gray-300 hover:text-emerald-300 transition-colors block py-1"
                >
                  {copy.gallery}
                </Link>
              </li>

              {/*Contact oldal */}
              <li>
                <Link
                  to="/contact"
                  onClick={scrollToTop}
                  className="text-gray-300 hover:text-emerald-300 transition-colors block py-1"
                >
                  {copy.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold text-base mb-4">
              {copy.legal}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-emerald-300 transition-colors block py-1"
                >
                  {copy.privacy}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-emerald-300 transition-colors block py-1"
                >
                  {copy.terms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-semibold text-base mb-4">
              {copy.social}
            </h3>

            <div className="flex items-center gap-3">
              <a
                href={FB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-gray-800 bg-gray-900/40 text-gray-200 hover:text-emerald-200 hover:border-emerald-500/30 hover:bg-gray-900/70 transition"
                aria-label="Facebook"
                title="Facebook"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>

              <button
                type="button"
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-gray-800 bg-gray-900/20 text-gray-500 cursor-not-allowed"
                aria-label="Instagram"
                title={copy.igSoon}
              >
                <FaInstagram className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              {copy.socialHint}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-900">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-gray-500">
            <p className="text-center sm:text-left">
              © 2026 Bermuda Vendégház. {copy.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
