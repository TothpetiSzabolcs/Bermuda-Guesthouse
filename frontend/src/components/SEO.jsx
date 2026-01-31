import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '../i18n/useI18n';

const SEO = ({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage = '/og-image.jpg',
  type = 'website',
  noindex = false 
}) => {
  const { lang } = useI18n();

  // Default értékek a nyelv alapján
  const defaultTitles = {
    hu: 'Bermuda Vendégház - Kikapcsolódás Somogy szívében',
    en: 'Bermuda Guesthouse - Relaxation in the Heart of Somogy',
    de: 'Bermuda Gästehaus - Entspannung im Herzen von Somogy'
  };

  const defaultDescriptions = {
    hu: 'Bermuda Vendégház - Legyen szó baráti összejövetelről, családi pihenésről vagy különleges programokról, nálunk megtalálja. Fürdőtó, grill, off-road túrák és hagyományos falusi élmények.',
    en: 'Bermuda Guesthouse - Whether it\'s a friendly gathering, family getaway, or special activities, we have it all. Bathing lake, grill, off-road tours, and traditional village experiences.',
    de: 'Bermuda Gästehaus - Ob Freundestreffen, Familienurlaub oder besondere Programme - bei uns finden Sie alles. Badeteich, Grill, Offroad-Touren und traditionelle Dorferlebnisse.'
  };

  const finalTitle = title || defaultTitles[lang];
  const finalDescription = description || defaultDescriptions[lang];
  const baseUrl = 'https://bermunda-vendeghaz.hu';
  const finalCanonicalUrl = canonicalUrl || baseUrl;

  // Hreflang linkek generálása
  const pagePath = canonicalUrl ? canonicalUrl.replace(baseUrl, '') : '/';
  const hreflangLinks = [
    { href: `${baseUrl}${pagePath}`, lang: 'hu' },
    { href: `${baseUrl}/en${pagePath}`, lang: 'en' },
    { href: `${baseUrl}/de${pagePath}`, lang: 'de' },
    { href: `${baseUrl}${pagePath}`, lang: 'x-default' }
  ];

  return (
    <Helmet>
      {/* Alapvető meta elemek */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonicalUrl} />
      
      {/* Robots meta */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* OpenGraph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:image" content={`${baseUrl}${ogImage}`} />
      <meta property="og:locale" content={lang === 'hu' ? 'hu_HU' : lang === 'de' ? 'de_DE' : 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${baseUrl}${ogImage}`} />
      
      {/* Hreflang */}
      {hreflangLinks.map(({ href, lang: hrefLang }) => (
        <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />
      ))}
      
      {/* Additional meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
    </Helmet>
  );
};

export default SEO;