import { useEffect, useState } from "react";
import SEO from "../components/SEO";

const API = import.meta.env.VITE_API_URL || "";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // ✅ FONTOS: prodon ne relatív /api..., hanem a VITE_API_URL-re menjen
        const url = new URL("/api/reviews", API || window.location.origin);
        url.searchParams.set("propertySlug", "bermuda-vendeghaz");
        url.searchParams.set("limit", "200");

        const response = await fetch(url.toString());
        const data = await response.json();

        if (response.ok) {
          setReviews(data.reviews || []);
        } else {
          setError("Hiba az értékelések betöltése közben");
        }
      } catch (e) {
        setError("Hálózati hiba");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Értékelések betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Vendégértékelések | Bermuda Vendégház"
        description="Olvassa el vendégeink visszajelzéseit a Bermuda Vendégházról. Tapasztalatok, értékelések és vélemények."
        canonicalUrl="https://bermuda-vendeghaz.hu/reviews"
      />

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Vendégértékelések
            </h1>
            <p className="text-lg text-gray-600">
              Itt olvashatja vendégeink visszajelzéseit
            </p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Még nincsenek értékelések.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => {
                const id =
                  review.id ||
                  review._id ||
                  `${review.code || "r"}-${review.createdAt || review.date || Math.random()}`;

                const displayDate = review.date || review.createdAt;
                const displayName = review.name || review.author;

                // ✅ label fix (legacy != web)
                const sourceLabel =
                  review.source === "legacy"
                    ? "Szállás.hu"
                    : review.source === "web"
                      ? "Web"
                      : review.source === "email"
                        ? "Email"
                        : review.source || "";

                return (
                  <div
                    key={id}
                    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xl ${
                              i < Math.ceil((review.rating || 0) / 2)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {sourceLabel && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {sourceLabel}
                          </span>
                        )}

                        <span className="text-sm text-gray-500">
                          {displayDate
                            ? new Date(displayDate).toLocaleDateString("hu-HU")
                            : ""}
                        </span>
                      </div>
                    </div>

                    {displayName && (
                      <p className="font-medium text-gray-900 mb-2">
                        {displayName}
                      </p>
                    )}

                    {/* ✅ üres szöveg kezelése */}
                    {review.text ? (
                      <p className="text-gray-700 leading-relaxed break-words">
                        {review.text}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">
                        Nincs szöveges megjegyzés.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Vendégünk volt? Örömmel vesszük, ha megosztja tapasztalatait.
            </p>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Vissza a főoldalra
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
