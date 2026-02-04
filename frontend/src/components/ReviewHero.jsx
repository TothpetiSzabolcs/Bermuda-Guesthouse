import { FiStar } from "react-icons/fi";
import { useReviews } from "../hooks/useReviews";

export default function ReviewsHero() {
  const { data, loading } = useReviews("bermuda-vendeghaz", 3);

  if (loading || !data) return null;

  const items = data.reviews ?? [];
  const shouldAnimate = items.length > 2;

  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl">
            <FiStar />
            <span className="text-xl font-bold">{data.average}</span>
          </div>

          <div className="text-gray-700">
            <div className="font-semibold">{data.count} vendég értékelése</div>
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
                    key={`${r?._id ?? "r"}-${i}`}
                    className="
                      bg-white rounded-xl shadow
                      flex-shrink-0
                      w-[260px] sm:w-[320px] lg:w-[360px]
                      p-3 sm:p-4
                    "
                  >
                    {r.text ? (
                      <p className="text-sm sm:text-sm text-gray-700 line-clamp-4">
                        “{r.text}”
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Szöveges értékelés nélkül
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(r.date).toLocaleDateString("hu-HU")}
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
