import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

const Footer = () => {
  const { lang } = useI18n();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">Bermuda Vendégház</h3>
            <p className="text-sm leading-relaxed">
              {lang === "hu" && "Kényelmes szállás a Balaton közelében. Modern felszereltség, barátságos környezet, felejthetetlen élmények."}
              {lang === "en" && "Comfortable accommodation near Lake Balaton. Modern amenities, friendly atmosphere, unforgettable experiences."}
              {lang === "de" && "Bequeme Unterkunft nahe dem Balaton. Moderne Ausstattung, freundliche Atmosphäre, unvergessliche Erlebnisse."}
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-semibold flex-shrink-0 min-w-[60px]">
                  {lang === "hu" && "Cím:"}
                  {lang === "en" && "Address:"}
                  {lang === "de" && "Adresse:"}
                </span>
                <span className="break-words">Somogy megye, Vése Zrínyi utca 1.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-semibold flex-shrink-0 min-w-[60px]">
                  {lang === "hu" && "Telefon:"}
                  {lang === "en" && "Phone:"}
                  {lang === "de" && "Telefon:"}
                </span>
                <a href="tel:+36302615608" className="hover:text-emerald-400 transition-colors break-words">06/30 261 5608</a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-semibold flex-shrink-0 min-w-[60px]">
                  {lang === "hu" && "Email:"}
                  {lang === "en" && "Email:"}
                  {lang === "de" && "Email:"}
                </span>
                <a href="mailto:bermudavendeghazvese@gmail.com" className="hover:text-emerald-400 transition-colors break-all">bermudavendeghazvese@gmail.com</a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-semibold flex-shrink-0 min-w-[60px]">
                  {lang === "hu" && "NTAK Szám:"}
                  {lang === "en" && "NTAK Number:"}
                  {lang === "de" && "NTAK Nummer:"}
                </span>
                <span className="break-words">MA24095212</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              {lang === "hu" && "Gyors linkek"}
              {lang === "en" && "Quick Links"}
              {lang === "de" && "Schnelle Links"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/"
                  className="hover:text-emerald-400 transition-colors block py-1"
                >
                  {lang === "hu" && "Főoldal"}
                  {lang === "en" && "Home"}
                  {lang === "de" && "Startseite"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/#rooms"
                  className="hover:text-emerald-400 transition-colors block py-1"
                >
                  {lang === "hu" && "Szobák"}
                  {lang === "en" && "Rooms"}
                  {lang === "de" && "Zimmer"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/gallery"
                  className="hover:text-emerald-400 transition-colors block py-1"
                >
                  {lang === "hu" && "Galéria"}
                  {lang === "en" && "Gallery"}
                  {lang === "de" && "Galerie"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/#contact"
                  className="hover:text-emerald-400 transition-colors block py-1"
                >
                  {lang === "hu" && "Kapcsolat"}
                  {lang === "en" && "Contact"}
                  {lang === "de" && "Kontakt"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              {lang === "hu" && "Jogi információk"}
              {lang === "en" && "Legal Information"}
              {lang === "de" && "Rechtliche Informationen"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/privacy"
                  className="hover:text-emerald-400 transition-colors block py-1"
                >
                  {lang === "hu" && "Adatkezelési tájékoztató"}
                  {lang === "en" && "Privacy Policy"}
                  {lang === "de" && "Datenschutzerklärung"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms"
                  className="hover:text-emerald-400 transition-colors block py-1"
                >
                  {lang === "hu" && "ÁSZF és lemondási feltételek"}
                  {lang === "en" && "Terms and Cancellation Policy"}
                  {lang === "de" && "AGB und Stornobedingungen"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400 gap-2">
            <p className="text-center sm:text-left">
              © 2026 Bermuda Vendégház. 
              {lang === "hu" && " Minden jog fenntartva."}
              {lang === "en" && " All rights reserved."}
              {lang === "de" && " Alle Rechte vorbehalten."}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;