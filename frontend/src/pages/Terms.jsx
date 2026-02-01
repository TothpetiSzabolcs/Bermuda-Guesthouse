import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";
import { useI18n } from "../i18n/useI18n";

const Terms = () => {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 sm:p-8 lg:p-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            {t('terms.title')}
          </h1>
          
          <div className="prose-legal">
            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.provider.title')}
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                {t('terms.sections.provider.content')}
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.services.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                {t('terms.sections.services.content')}
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.prices.title')}
              </h2>
              <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                <strong>{t('terms.sections.prices.prices')}</strong>
              </p>
              <p className="text-gray-700 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                <strong>{t('terms.sections.prices.payment')}</strong>
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.bookingProcess.title')}
              </h2>
              <ol className="list-decimal pl-5 sm:pl-6 lg:pl-8 text-gray-700 space-y-2 sm:space-y-1.5 text-sm sm:text-base">
                {t('terms.sections.bookingProcess.steps', { returnArray: true }).map((step, index) => (
                  <li key={index} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.cancellation.title')}
              </h2>
              <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                <strong>{t('terms.sections.cancellation.freeLabel')}</strong>
              </p>
              <ul className="list-disc pl-5 sm:pl-6 lg:pl-8 text-gray-700 space-y-2 sm:space-y-1.5 text-sm sm:text-base">
                {t('terms.sections.cancellation.rules', { returnArray: true }).map((rule, index) => (
                  <li key={index} className="leading-relaxed">{rule}</li>
                ))}
              </ul>
              <p className="text-gray-700 mt-3 sm:mt-4 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                {t('terms.sections.cancellation.notice')}
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.guestObligations.title')}
              </h2>
              <ul className="list-disc pl-5 sm:pl-6 lg:pl-8 text-gray-700 space-y-2 sm:space-y-1.5 text-sm sm:text-base">
                {t('terms.sections.guestObligations.items', { returnArray: true }).map((item, index) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.providerObligations.title')}
              </h2>
              <ul className="list-disc pl-5 sm:pl-6 lg:pl-8 text-gray-700 space-y-2 sm:space-y-1.5 text-sm sm:text-base">
                {t('terms.sections.providerObligations.items', { returnArray: true }).map((item, index) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.forceMajeure.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                {t('terms.sections.forceMajeure.content')}
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.houseRules.title')}
              </h2>
              <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                <strong>{t('terms.sections.houseRules.checkin')}</strong><br />
                <strong>{t('terms.sections.houseRules.checkout')}</strong>
              </p>
              <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                <strong>{t('terms.sections.houseRules.rulesTitle')}</strong>
              </p>
              <ul className="list-disc pl-5 sm:pl-6 lg:pl-8 text-gray-700 space-y-2 sm:space-y-1.5 text-sm sm:text-base">
                {t('terms.sections.houseRules.rules', { returnArray: true }).map((rule, index) => (
                  <li key={index} className="leading-relaxed">{rule}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.complaints.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                {t('terms.sections.complaints.content')}
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-snug">
                {t('terms.sections.miscellaneous.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed sm:leading-relaxed text-sm sm:text-base">
                {t('terms.sections.miscellaneous.content')}
              </p>
            </section>

            <div className="pt-6 sm:pt-8 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {t('terms.effectiveDate')}<br />
                {t('terms.disclaimer')}
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-3 sm:px-6 sm:py-3.5 text-green-700 hover:text-green-800 hover:bg-green-50 font-medium rounded-lg transition-colors min-w-[44px] min-h-[44px] text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              {t('terms.backToHome')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;