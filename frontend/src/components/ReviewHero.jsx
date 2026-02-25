import { useReviews } from "../hooks/useReviews";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

export default function ReviewsHero() {
  const { t, lang } = useI18n();
  const { data, loading } = useReviews("bermuda-vendeghaz", 6);

  if (loading || !data) return null;

  const items = (data?.reviews ?? [])
    .filter((r) => r.text && r.text.trim().length > 0)
    .map((r, i) => ({
      key: r.id || r._id || `r-${i}`,
      text: r.text.length > 80 ? r.text.slice(0, 80).trimEnd() + "…" : r.text,
    }));

  if (!items.length) return null;

  const shouldAnimate = items.length > 2;

  return (
    <section className="bg-white  mt-4 sm:mt-6">
      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6 flex items-center gap-4 sm:gap-6">
        {/* Bal oldal: "Összes" link — pill stílusú gomb */}
        <Link
          to="/reviews"
          className="shrink-0 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition whitespace-nowrap"
        >
          {t("reviews.hero.allReviews")} →
        </Link>

        {/* Elválasztó vonal */}
        <div className="w-px h-6 bg-gray-200 shrink-0" />

        {/* Jobb oldal: scrollozó idézetek */}
        <div className="flex-1 overflow-hidden relative reviews-fade-compact">
          <div className="group">
            <div
              className={`flex items-center gap-6 w-max ${
                shouldAnimate ? "animate-reviews-compact" : ""
              }`}
            >
              {(shouldAnimate ? [...items, ...items] : items).map((r, i) => (
                <span
                  key={`${r.key}-${i}`}
                  className="text-sm text-gray-500 italic whitespace-nowrap"
                >
                  „{r.text}"
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
