import React, { useMemo, useState } from "react";
import { useGallery } from "../hooks/useGallery";
import { useGalleryCovers } from "../hooks/useGalleryCovers";
import { useI18n } from "../i18n/useI18n";
import { cld } from "../utils/cloudinary";
import Lightbox from "./Lightbox";
import { FaPlay } from "react-icons/fa";

const SERVICE_CATS = ["konyha", "etkezo", "nappali", "nagyterem", "kavezoteazo", "terasz"];
const PROPERTY_SLUG = "bermuda-vendeghaz";

export default function Services() {
  const { lang, t } = useI18n();

  const [cat, setCat] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  // Covers for service category cards
  const { covers } = useGalleryCovers(PROPERTY_SLUG, SERVICE_CATS);

  const { items = [], total = 0, loading, error } = useGallery(PROPERTY_SLUG, {
    category: cat || "all",
    page: 1,
    limit: 24,
    enabled: !!cat,
  });

  const unit = useMemo(
    () => ({ hu: "kép", en: "photos", de: "Bilder" }[lang] || "kép"),
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
  const getVideoSrc = (m) => (m.url.endsWith(".mp4") ? m.url : cld(m.url, "f_mp4,q_auto"));
  const getPosterSrc = (m) =>
    m.posterUrl ? cld(m.posterUrl, "f_auto,q_auto,w_1600") : cld(m.url, "so_1,f_jpg,q_auto,w_1600");

  const onOpen = (idx) => setOpenIndex(idx);
  const onClose = () => setOpenIndex(null);
  const onPrev = () => setOpenIndex((i) => (i === null ? null : (i + items.length - 1) % items.length));
  const onNext = () => setOpenIndex((i) => (i === null ? null : (i + 1) % items.length));

  // ========== 1) CATEGORY SELECTION VIEW (Services cards) ==========
  if (!cat) {
    const placeholderImages = {
      konyha: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=700&fit=crop&crop=center",
      etkezo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=700&fit=crop&crop=center",
      nappali: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=700&fit=crop&crop=center",
      nagyterem: "https://images.unsplash.com/photo-1519167758481-91532716981d?w=1200&h=700&fit=crop&crop=center",
      kavezoteazo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=700&fit=crop&crop=center",
      terasz: "https://images.unsplash.com/photo-1560185127-cd55a6ce8ae2?w=1200&h=700&fit=crop&crop=center",
    };

    return (
      <section id="services" className="scroll-mt-16 py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
              {t("services.title")}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">{t("services.lead")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {SERVICE_CATS.map((key) => {
              const coverRaw = covers?.[key]?.coverRaw || null;
              const coverSrc = coverRaw
                ? cld(coverRaw, "f_auto,q_auto,w_1200")
                : placeholderImages[key];

              return (
                <button
                  key={key}
                  onClick={() => setCat(key)}
                  className="group relative overflow-hidden rounded-2xl bg-gray-100 text-left shadow hover:shadow-lg transition"
                >
                  <img
                    src={coverSrc}
                    alt={t(`services.categories.${key}`)}
                    className="h-56 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-xl font-semibold">{t(`services.categories.${key}`)}</h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ========== 2) CATEGORY DETAIL VIEW ==========
  return (
    <section id="services" className="scroll-mt-16 py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              {t(`services.categories.${cat}`)}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">{t("services.lead")}</p>
          </div>
          <button
            onClick={() => setCat(null)}
            className="self-start rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t("gallery.backToCategories")}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SERVICE_CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition
              ${
                cat === c
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t(`services.categories.${c}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">{t("common.loading")}</div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{t("common.error")}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-600">{t("gallery.empty")}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
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
                    className="h-40 sm:h-48 md:h-52 w-full object-center bg-black/5 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  {isVideo && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                      <FaPlay className="h-3 w-3" /> {t("common.video")}
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
  );
}
