import { Link } from "react-router-dom";
import { useI18n } from "../i18n/LanguageProvider";
import { useGalleryCovers } from "../hooks/useGalleryCovers";
import { cld } from "../utils/cloudinary";

const CATS = ["to","udvar","wellness","programok","egyeb"];

export default function GalleryLanding() {
  const { t } = useI18n();
  const { covers, loading } = useGalleryCovers("bermuda-vendeghaz");

  if (loading) return <div className="py-16 text-center">{t("common.loading")}</div>;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATS.map(cat => {
          const coverRaw = covers?.[cat]?.coverRaw || null;
          const bg = coverRaw ? cld(coverRaw, "f_auto,q_auto,c_fill,g_center,w_800,h_500") : null;
          return (
            <Link
              key={cat}
              to={`/gallery?category=${cat}`}
              className="group relative rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
            >
              <div
                className="h-48 w-full bg-gray-200 bg-center bg-cover"
                style={bg ? { backgroundImage: `url(${bg})` } : undefined}
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-semibold">{t(`gallery.filters.${cat}`)}</h3>
                <p className="text-white/80 text-sm">{t("gallery.lead")}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
