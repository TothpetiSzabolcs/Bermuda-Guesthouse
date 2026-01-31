import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

const Footer = () => {
  const { lang } = useI18n();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Bermuda Vendégház</h3>
            <p className="text-sm leading-relaxed">
              {lang === "hu" && "Kényelmes szállás a Balaton közelében. Modern felszereltség, barátságous környezet, felejthetetlen élmények."}
              {lang === "en" && "Comfortable accommodation near Lake Balaton. Modern amenities, friendly atmosphere, unforgettable experiences."}
              {lang === "de" && "Bequeme Unterkunft nahe dem Balaton. Moderne Ausstattung, freundliche Atmosphäre, unvergessliche Erlebnisse."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {lang === "hu" && "Gyors linkek"}
              {lang === "en" && "Quick Links"}
              {lang === "de" && "Schnelle Links"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {lang === "hu" && "Főoldal"}
                  {lang === "en" && "Home"}
                  {lang === "de" && "Startseite"}
                </Link>
              </li>
              <li>
                <a 
                  href="#rooms"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {lang === "hu" && "Szobák"}
                  {lang === "en" && "Rooms"}
                  {lang === "de" && "Zimmer"}
                </a>
              </li>
              <li>
                <Link 
                  to="/gallery"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {lang === "hu" && "Galéria"}
                  {lang === "en" && "Gallery"}
                  {lang === "de" && "Galerie"}
                </Link>
              </li>
              <li>
                <a 
                  href="#contact"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {lang === "hu" && "Kapcsolat"}
                  {lang === "en" && "Contact"}
                  {lang === "de" && "Kontakt"}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {lang === "hu" && "Jogi információk"}
              {lang === "en" && "Legal Information"}
              {lang === "de" && "Rechtliche Informationen"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/privacy"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {lang === "hu" && "Adatkezelési tájékoztató"}
                  {lang === "en" && "Privacy Policy"}
                  {lang === "de" && "Datenschutzerklärung"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {lang === "hu" && "ÁSZF és lemondási feltételek"}
                  {lang === "en" && "Terms and Cancellation Policy"}
                  {lang === "de" && "AGB und Stornobedingungen"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              © 2026 Bermuda Vendégház. 
              {lang === "hu" && " Minden jog fenntartva."}
              {lang === "en" && " All rights reserved."}
              {lang === "de" && " Alle Rechte vorbehalten."}
            </p>
            <p className="mt-2 md:mt-0">
              {lang === "hu" && "Email: info@bermuda-vendeghaz.hu"}
              {lang === "en" && "Email: info@bermuda-vendeghaz.hu"}
              {lang === "de" && "Email: info@bermuda-vendeghaz.hu"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;