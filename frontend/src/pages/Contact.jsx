import React from "react";
import Header from "../components/header";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { useI18n } from "../i18n/useI18n";
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiNavigation 
} from "react-icons/fi";

const Contact = () => {
  const { t } = useI18n();

  const contactInfo = {
    name: "Bermuda Vendégház",
    ntakNumber: "MA24095212",
    address: "Somogy megye, Vése Zrínyi utca 1.",
    phone: "06/30 261 5608",
    email: "bermudavendeghazvese@gmail.com",
    googleMapsUrl: "https://maps.google.com/?q=Somogy+megye,+Vése+Zrínyi+utca+1."
  };

  return (
    <>
      <SEO
        title={t("contact.seo.title")}
        description={t("contact.seo.description")}
        canonicalUrl="/contact"
      />
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {t("contact.title")}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t("contact.lead")}
              </p>
            </div>

            {/* Contact Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {/* Name Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiMapPin className="w-6 h-6 text-emerald-600 shrink-0" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {t("contact.name")}
                  </h3>
                </div>
                <p className="text-gray-700 font-medium">{contactInfo.name}</p>
                <p className="text-sm text-gray-500 mt-1">{t("contact.ntakLabel")}: {contactInfo.ntakNumber}</p>
              </div>

              {/* Address Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiMapPin className="w-6 h-6 text-emerald-600 shrink-0" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {t("contact.address")}
                  </h3>
                </div>
                <p className="text-gray-700">{contactInfo.address}</p>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiPhone className="w-6 h-6 text-emerald-600 shrink-0" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {t("contact.phone")}
                  </h3>
                </div>
                <a
                  href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  {contactInfo.phone}
                </a>
                <p className="text-sm text-gray-500 mt-1">{t("contact.clickToCall")}</p>
              </div>

              {/* Email Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiMail className="w-6 h-6 text-emerald-600 shrink-0" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {t("contact.email")}
                  </h3>
                </div>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors break-all"
                >
                  {contactInfo.email}
                </a>
                <p className="text-sm text-gray-500 mt-1">{t("contact.clickToEmail")}</p>
              </div>

              {/* Map Navigation Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 md:col-span-2 lg:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiNavigation className="w-6 h-6 text-emerald-600 shrink-0" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {t("contact.navigation")}
                  </h3>
                </div>
                <p className="text-gray-700 mb-4">{t("contact.navigationDesc")}</p>
                <a
                  href={contactInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FiNavigation className="w-5 h-5 mr-2 shrink-0" />
                  {t("contact.planRoute")}
                </a>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="mt-12 bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("contact.additionalInfo.title")}
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 mb-4">
                  {t("contact.additionalInfo.description")}
                </p>
                <div className="grid gap-4 mt-6">
                  <div className="flex items-start">
                    <div className="w-6 h-6 text-emerald-600 mr-3 mt-0.5">✓</div>
                    <p className="text-gray-700">{t("contact.additionalInfo.checkIn")}</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 text-emerald-600 mr-3 mt-0.5">✓</div>
                    <p className="text-gray-700">{t("contact.additionalInfo.checkOut")}</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 text-emerald-600 mr-3 mt-0.5">✓</div>
                    <p className="text-gray-700">{t("contact.additionalInfo.languages")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;