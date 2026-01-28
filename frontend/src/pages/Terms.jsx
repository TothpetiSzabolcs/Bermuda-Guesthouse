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
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {t('terms.title')}
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.provider.title')}
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {t('terms.sections.provider.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.services.title')}
              </h2>
              <p className="text-gray-700">
                {t('terms.sections.services.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.prices.title')}
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>{t('terms.sections.prices.prices')}</strong>
              </p>
              <p className="text-gray-700">
                <strong>{t('terms.sections.prices.payment')}</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.bookingProcess.title')}
              </h2>
              <ol className="list-decimal pl-6 text-gray-700 space-y-1">
                {t('terms.sections.bookingProcess.steps', { returnArray: true }).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.cancellation.title')}
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>{t('terms.sections.cancellation.freeLabel')}</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t('terms.sections.cancellation.rules', { returnArray: true }).map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
              <p className="text-gray-700 mt-2">
                {t('terms.sections.cancellation.notice')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.guestObligations.title')}
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t('terms.sections.guestObligations.items', { returnArray: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.providerObligations.title')}
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t('terms.sections.providerObligations.items', { returnArray: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.forceMajeure.title')}
              </h2>
              <p className="text-gray-700">
                {t('terms.sections.forceMajeure.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.houseRules.title')}
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>{t('terms.sections.houseRules.checkin')}</strong><br />
                <strong>{t('terms.sections.houseRules.checkout')}</strong>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>{t('terms.sections.houseRules.rulesTitle')}</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t('terms.sections.houseRules.rules', { returnArray: true }).map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.complaints.title')}
              </h2>
              <p className="text-gray-700">
                {t('terms.sections.complaints.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('terms.sections.miscellaneous.title')}
              </h2>
              <p className="text-gray-700">
                {t('terms.sections.miscellaneous.content')}
              </p>
            </section>

            <div className="pt-6 border-t">
              <p className="text-sm text-gray-600">
                {t('terms.effectiveDate')}<br />
                {t('terms.disclaimer')}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Link
              to="/"
              className="inline-flex items-center text-green-700 hover:text-green-800 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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