import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";
import { useI18n } from "../i18n/useI18n";

const Privacy = () => {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {t('privacy.title')}
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.sections.provider.title')}
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {t('privacy.sections.provider.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.sections.dataScope.title')}
              </h2>
              <p className="text-gray-700 mb-2">
                {t('privacy.sections.dataScope.intro')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t('privacy.sections.dataScope.items', { returnArray: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700 mt-2">
                <strong>{t('privacy.sections.dataScope.purpose')}</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.sections.legalBasis.title')}
              </h2>
              <p className="text-gray-700">
                {t('privacy.sections.legalBasis.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.sections.retention.title')}
              </h2>
              <p className="text-gray-700">
                {t('privacy.sections.retention.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.sections.dataTransfer.title')}
              </h2>
              <p className="text-gray-700">
                {t('privacy.sections.dataTransfer.intro')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t('privacy.sections.dataTransfer.items', { returnArray: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700 mt-2">
                {t('privacy.sections.dataTransfer.disclaimer')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.sections.rights.title')}
              </h2>
              <p className="text-gray-700 mb-2">
                {t('privacy.sections.rights.intro')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t('privacy.sections.rights.items', { returnArray: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.sections.cookies.title')}
              </h2>
              <p className="text-gray-700">
                {t('privacy.sections.cookies.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.sections.complaints.title')}
              </h2>
              <p className="text-gray-700">
                {t('privacy.sections.complaints.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.sections.contact.title')}
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {t('privacy.sections.contact.content')}
              </p>
            </section>

            <div className="pt-6 border-t">
              <p className="text-sm text-gray-600">
                {t('privacy.effectiveDate')}<br />
                {t('privacy.disclaimer')}
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
              {t('privacy.backToHome')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;