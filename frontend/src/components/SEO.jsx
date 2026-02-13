import { useEffect } from "react";
import { useI18n } from "../i18n/useI18n";

const ensureMeta = (selector, createFn) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = createFn();
    document.head.appendChild(el);
  }
  return el;
};

const setMetaName = (name, content) => {
  if (content == null) return;
  const el = ensureMeta(`meta[name="${name}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("name", name);
    return m;
  });
  el.setAttribute("content", content);
};

const setMetaProperty = (property, content) => {
  if (content == null) return;
  const el = ensureMeta(`meta[property="${property}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("property", property);
    return m;
  });
  el.setAttribute("content", content);
};

const setLinkRel = (rel, href) => {
  if (!href) return;
  const el = ensureMeta(`link[rel="${rel}"]`, () => {
    const l = document.createElement("link");
    l.setAttribute("rel", rel);
    return l;
  });
  el.setAttribute("href", href);
};

const upsertAlternate = (hrefLang, href) => {
  if (!href) return;
  const selector = `link[rel="alternate"][hreflang="${hrefLang}"]`;
  const el = ensureMeta(selector, () => {
    const l = document.createElement("link");
    l.setAttribute("rel", "alternate");
    l.setAttribute("hreflang", hrefLang);
    return l;
  });
  el.setAttribute("href", href);
};

const removeAlternates = () => {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((n) => n.remove());
};

const removeMetaName = (name) => {
  document.head.querySelectorAll(`meta[name="${name}"]`).forEach((n) => n.remove());
};

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

  useEffect(() => {
    const finalTitle = title || defaultTitles[lang] || defaultTitles.hu;
    const finalDescription =
      description || defaultDescriptions[lang] || defaultDescriptions.hu;

    const baseUrl = "https://bermuda-vendeghaz.hu";
    const finalCanonicalUrl = canonicalUrl || baseUrl;
    const ogImageAbs = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;

    // Title + description + canonical
    document.title = finalTitle;
    setMetaName("description", finalDescription);
    setLinkRel("canonical", finalCanonicalUrl);

    // Robots
    if (noindex) setMetaName("robots", "noindex,nofollow");
    else removeMetaName("robots");

    // Open Graph
    setMetaProperty("og:title", finalTitle);
    setMetaProperty("og:description", finalDescription);
    setMetaProperty("og:type", type);
    setMetaProperty("og:url", finalCanonicalUrl);
    setMetaProperty("og:image", ogImageAbs);
    setMetaProperty(
      "og:locale",
      lang === "hu" ? "hu_HU" : lang === "de" ? "de_DE" : "en_US"
    );

    // Twitter
    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", finalTitle);
    setMetaName("twitter:description", finalDescription);
    setMetaName("twitter:image", ogImageAbs);

    // Hreflang (csak ha tényleg kell)
    if (includeHreflang) {
      upsertAlternate("hu", finalCanonicalUrl);
      upsertAlternate("en", finalCanonicalUrl);
      upsertAlternate("de", finalCanonicalUrl);
      upsertAlternate("x-default", finalCanonicalUrl);
    } else {
      removeAlternates();
    }
  }, [
    lang,
    title,
    description,
    canonicalUrl,
    ogImage,
    type,
    noindex,
    includeHreflang,
  ]);

  return null;
};

export default SEO;
