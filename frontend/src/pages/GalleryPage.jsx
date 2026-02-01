import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useGallery } from "../hooks/useGallery";
import { useGalleryCovers } from "../hooks/useGalleryCovers";
import { useI18n } from "../i18n/useI18n";
import { cld } from "../utils/cloudinary";
import Lightbox from "../components/Lightbox";
import { FaPlay } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import SEO from "../components/SEO";
import Header from "../components/header";
import Footer from "../components/Footer";

const GALLERY_CATS = [
  "to",
  "udvar",
  "csarda",
  "wellness",
  "programok",
  "egyeb",
];
const PROPERTY_SLUG = "bermuda-vendeghaz";

export default function GalleryPage() {
  const { lang, t } = useI18n();
  const { category } = useParams();
  const navigate = useNavigate();

  const [cat, setCat] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  // Covers for category cards (public -> admin isCover)
  const { covers } = useGalleryCovers(PROPERTY_SLUG, GALLERY_CATS);

  // Sync URL param -> state
  useEffect(() => {
    if (category && GALLERY_CATS.includes(category)) {
      setCat(category);
    } else if (category) {
      navigate("/gallery", { replace: true });
    } else {
      setCat(null);
    }
  }, [category, navigate]);

  const {
    items = [],
    total = 0,
    loading,
    error,
  } = useGallery(PROPERTY_SLUG, {
    category: cat || "all",
    page: 1,
    limit: 24,
    enabled: !!cat,
  });

  const unit = useMemo(
    () => ({ hu: "kép", en: "photos", de: "Bilder" })[lang] || "kép",
    [lang],
  );

  const getAlt = (m) =>
    m.alt?.[lang] ||
    m.alt?.hu ||
    (lang === "en"
      ? "Gallery image"
      : lang === "de"
        ? "Galeriebild"
        : "Galéria kép");

  const getThumb = (m) => {
    if (m.resourceType === "video") {
      const base = m.posterUrl || m.url;
      return m.posterUrl
        ? cld(base, "f_auto,q_auto,w_600")
        : cld(base, "so_1,f_jpg,q_auto,w_600");
    }
    return cld(m.url, "f_auto,q_auto,w_600");
  };

  const getFullImg = (m) => cld(m.url, "f_auto,q_auto,w_1600");
  const getVideoSrc = (m) =>
    m.url.endsWith(".mp4") ? m.url : cld(m.url, "f_mp4,q_auto");
  const getPosterSrc = (m) =>
    m.posterUrl
      ? cld(m.posterUrl, "f_auto,q_auto,w_1600")
      : cld(m.url, "so_1,f_jpg,q_auto,w_1600");

  const onOpen = (idx) => setOpenIndex(idx);
  const onClose = () => setOpenIndex(null);
  const onPrev = () =>
    setOpenIndex((i) =>
      i === null ? null : (i + items.length - 1) % items.length,
    );
  const onNext = () =>
    setOpenIndex((i) => (i === null ? null : (i + 1) % items.length));

  const handleCategorySelect = (selectedCat) => {
    navigate(`/gallery/${selectedCat}`);
  };

  const handleBackToCategories = () => {
    navigate("/gallery");
  };

  // ========== 1) CATEGORY SELECTION VIEW ==========
  if (!cat) {
    const placeholderImages = {
      to: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=700&fit=crop&crop=center",
      udvar:
        "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=1200&h=700&fit=crop&crop=center",
      csarda:
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&h=700&fit=crop&crop=center",
      wellness:
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=700&fit=crop&crop=center",
      programok:
        "https://images.unsplash.com/photo-1521334726092-b509a19597c6?w=1200&h=700&fit=crop&crop=center",
      egyeb:
        "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200&h=700&fit=crop&crop=center",
    };

    return (
      <>
        <SEO
          title={`${t("gallery.title")} | Bermuda Vendégház`}
          description={t("gallery.lead")}
          canonicalUrl="https://bermuda-vendeghaz.hu/gallery"
        />

        <Header />

        <section className="scroll-mt-24 pt-24 pb-12 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-green-600 font-medium mb-8 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              {t("common.backToHome")}
            </Link>

            <div className="text-center mb-20">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {t("gallery.title")}
              </h1>
              <p className="mt-3 text-gray-600">{t("gallery.lead")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {GALLERY_CATS.map((key) => {
                const coverRaw = covers?.[key]?.coverRaw || null;
                const coverSrc = coverRaw
                  ? cld(coverRaw, "f_auto,q_auto,w_1200")
                  : placeholderImages[key];

                return (
                  <button
                    key={key}
                    onClick={() => handleCategorySelect(key)}
                    className="group relative overflow-hidden rounded-2xl bg-gray-100 text-left shadow hover:shadow-lg transition"
                  >
                     <img
                       src={coverSrc}
                       alt={t(`gallery.filters.${key}`)}
                       className="aspect-video h-56 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                       loading="lazy"
                       decoding="async"
                     />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                     <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                       <h3 className="text-xl font-semibold truncate">
                         {t(`gallery.filters.${key}`)}
                       </h3>
                     </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </>
    );
  }

  // ========== 2) CATEGORY DETAIL VIEW ==========
  return (
    <>
      <SEO
        title={`${t(`gallery.filters.${cat}`)} – ${t("gallery.title")} | Bermuda Vendégház`}
        description={t("gallery.lead")}
        canonicalUrl={`https://bermuda-vendeghaz.hu/gallery/${cat}`}
      />

      <section className="scroll-mt-24 pt-24 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {t(`gallery.filters.${cat}`)}
              </h1>
              <p className="mt-2 text-gray-600">{t("gallery.lead")}</p>
            </div>
            <button
              onClick={handleBackToCategories}
              className="self-start rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("gallery.backToCategories")}
            </button>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-8 pb-2 sm:pb-0 sm:overflow-x-visible sm:flex-wrap sm:justify-center">
            {GALLERY_CATS.map((c) => (
              <button
                key={c}
                onClick={() => handleCategorySelect(c)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition whitespace-nowrap
              ${
                cat === c
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              >
                {t(`gallery.filters.${c}`)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">{t("common.loading")}</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              {t("common.error")}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              {t("gallery.empty")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {items.map((m, idx) => {
                const thumb = getThumb(m);
                const isVideo = m.resourceType === "video";
                return (
                  <button
                    key={m._id}
                    onClick={() => onOpen(idx)}
                    className="group relative overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label={getAlt(m)}
                  >
                     <img
                       src={thumb}
                       alt={getAlt(m)}
                       className="aspect-square h-40 sm:h-48 md:h-52 w-full object-center object-cover bg-black/5 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                       loading="lazy"
                       decoding="async"
                     />
                     {isVideo && (
                       <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white whitespace-nowrap">
                         <FaPlay className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{t("common.video")}</span>
                       </span>
                     )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}

          {total > 0 && (
            <div className="text-center mt-6 text-sm text-gray-500">
              {total} {unit}
            </div>
          )}
        </div>

        {openIndex !== null && items.length > 0 && (
          <Lightbox
            items={items}
            index={openIndex}
            onClose={onClose}
            onPrev={onPrev}
            onNext={onNext}
            getAlt={getAlt}
            getImgSrc={getFullImg}
            getVideoSrc={getVideoSrc}
            getPosterSrc={getPosterSrc}
          />
        )}
      </section>
      <Footer />
    </>
  );
}
