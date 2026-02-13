import React from "react";
import { Helmet } from "react-helmet-async";
import { useI18n } from "../i18n/useI18n";

const SEO = ({
  title,
  description,
  canonicalUrl,
  ogImage = "/og-image.jpg",
  type = "website",
  noindex = false,
  includeHreflang = false,
}) => {
  const { lang } = useI18n();

  const defaultTitles = {
    hu: "Bermuda Vendégház - Kikapcsolódás Somogy szívében",
    en: "Bermuda Guesthouse - Relaxation in the Heart of Somogy",
    de: "Bermuda Gästehaus - Entspannung im Herzen von Somogy",
  };

  const defaultDescriptions = {
    hu: "Bermuda Vendégház - Legyen szó baráti összejövetelről, családi pihenésről vagy különleges programokról, nálunk megtalálja. Fürdőtó, grill, off-road túrák és hagyományos falusi élmények.",
    en: "Bermuda Guesthouse - Whether it's a friendly gathering, family getaway, or special activities, we have it all. Bathing lake, grill, off-road tours, and traditional village experiences.",
    de: "Bermuda Gästehaus - Ob Freundestreffen, Familienurlaub oder besondere Programme - bei uns finden Sie alles. Badeteich, Grill, Offroad-Touren und traditionelle Dorferlebnisse.",
  };

  const finalTitle = title || defaultTitles[lang];
  const finalDescription = description || defaultDescriptions[lang];
  const baseUrl = "https://bermuda-vendeghaz.hu";
  const finalCanonicalUrl = canonicalUrl || baseUrl;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={finalCanonicalUrl} />

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:image" content={`${baseUrl}${ogImage}`} />
      <meta
        property="og:locale"
        content={lang === "hu" ? "hu_HU" : lang === "de" ? "de_DE" : "en_US"}
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${baseUrl}${ogImage}`} />

      {/* Hreflang csak akkor, ha tényleg van külön URL nyelvenként */}
      {includeHreflang ? (
        <>
          <link rel="alternate" hrefLang="hu" href={finalCanonicalUrl} />
          <link rel="alternate" hrefLang="en" href={finalCanonicalUrl} />
          <link rel="alternate" hrefLang="de" href={finalCanonicalUrl} />
          <link rel="alternate" hrefLang="x-default" href={finalCanonicalUrl} />
        </>
      ) : null}
    </Helmet>
  );
};

export default SEO;
