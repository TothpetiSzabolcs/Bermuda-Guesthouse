import { FiStar } from "react-icons/fi";
import { useReviews } from "../hooks/useReviews";
import { Link } from "react-router-dom";

export default function ReviewsHero() {
  const { data, loading } = useReviews("bermuda-vendeghaz", 3);

  if (loading || !data) return null;

  const items = (data?.reviews ?? []).map((r, i) => ({
    key: r.id || r._id || `${r.code || "r"}-${r.createdAt || r.date || i}`,
    text: r.text || "",
    when: r.createdAt || r.date,
  }));
  const shouldAnimate = items.length > 2;

  const count = Number(data?.count ?? data?.total ?? items.length ?? 0);

  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl">
            <FiStar />
            <span className="text-xl font-bold">{data.average}</span>
          </div>

          <div className="text-gray-700 flex-1">
            <div className="flex items-center justify-between gap-4">
              <div className="font-semibold">{count} vendég értékelése</div>

              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Összes értékelés
              </Link>
            </div>
          </div>
        </div>

        {/* Futósáv + fade szélek */}
        <div className="relative overflow-hidden reviews-fade">
          {/* extra padding, hogy ne “vágja le” a shadowt */}
          <div className="py-2">
            <div className="group">
              <div
                className={`flex gap-3 sm:gap-4 w-max ${
                  shouldAnimate ? "animate-reviews" : ""
                }`}
              >
                {(shouldAnimate ? [...items, ...items] : items).map((r, i) => (
                  <div
                    key={`${r.key}-${i}`}
                    className="bg-white rounded-xl shadow flex-shrink-0 w-[260px] sm:w-[320px] lg:w-[360px] p-3 sm:p-4"
                  >
                    {r.text ? (
                      <p className="text-sm text-gray-700 line-clamp-4">
                        “{r.text}”
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Szöveges értékelés nélkül
                      </p>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      {r.when
                        ? new Date(r.when).toLocaleDateString("hu-HU")
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
