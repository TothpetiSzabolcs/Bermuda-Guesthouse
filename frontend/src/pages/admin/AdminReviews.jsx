import { useState, useEffect, useCallback } from "react";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_URL || "";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const buildAdminUrl = (path, params) => {
    const base = (API && API.trim()) || window.location.origin;
    const url = new URL(path, base);

    if (params) {
      if (params instanceof URLSearchParams) {
        params.forEach((v, k) => {
          if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
        });
      } else {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
        });
      }
    }

    return url.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (!Number.isFinite(d.getTime())) return "";
    return d.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sourceLabel = (src) => {
    switch (src) {
      case "web":
        return "Web";
      case "email":
        return "Email";
      case "legacy":
        return "Korábbi";
      default:
        return src || "";
    }
  };

  const toStars5 = (review) => {
    const r = Number(review?.rating || 0);

    if (review?.source === "legacy") {
      return Math.min(5, Math.max(0, r / 2));
    }

    return Math.min(5, Math.max(0, r));
  };

  const formatRatingText = (review) => {
    const r = Number(review?.rating || 0);
    if (review?.source === "legacy") return `${r}/10`;
    return `${r}/5`;
  };

  const renderStars = (stars5) => {
    const full = Math.round(Number(stars5 || 0));
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < full ? "text-yellow-500" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "20",
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const url = buildAdminUrl("/api/admin/reviews", params);

      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      const list = data.reviews || data.items || [];
      const pages =
        data?.pagination?.pages ??
        data?.pages ??
        Math.max(1, Math.ceil((data?.total ?? list.length) / 20));

      setReviews(Array.isArray(list) ? list : []);
      setTotalPages(Number(pages) || 1);

      if (currentPage > (Number(pages) || 1)) {
        setCurrentPage(1);
      }
    } catch (e) {
      console.error("Error fetching reviews:", e);
      setError("Hálózati hiba / nem sikerült betölteni a véleményeket.");
      setReviews([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  const mutate = async (reviewId, action) => {
    try {
      setActionLoading(reviewId);
      setError(null);

      const url = buildAdminUrl(
        `/api/admin/reviews/${encodeURIComponent(reviewId)}/${action}`
      );

      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await fetchReviews();
    } catch (e) {
      console.error(`Error ${action} review:`, e);
      setError(
        "Nem sikerült végrehajtani a műveletet. (Lehet, hogy lejárt a session?)"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (reviewId) => mutate(reviewId, "approve");
  const handleReject = (reviewId) => mutate(reviewId, "reject");

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <>
      <SEO title="Vélemények kezelése – Admin" noindex />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Vélemények kezelése
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Itt moderálhatod a beérkezett véleményeket.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-gray-700"
          >
            Státusz:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          >
            <option value="pending">Függőben</option>
            <option value="approved">Jóváhagyott</option>
            <option value="rejected">Elutasított</option>
            <option value="all">Összes</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Betöltés...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              Nincsenek vélemények a kiválasztott szűrővel.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const id = review.id || review._id;
              const created = review.createdAt || review.date;
              const name = review.name || review.author || "Névtelen";
              const text = (review.text || "").trim();

              const stars5 = toStars5(review);
              const ratingText = formatRatingText(review);

              return (
                <div
                  key={id}
                  className="border rounded-lg p-4 space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">{name}</span>

                        {review.status && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              review.status
                            )}`}
                          >
                            {review.status === "pending" && "Függőben"}
                            {review.status === "approved" && "Jóváhagyott"}
                            {review.status === "rejected" && "Elutasított"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center">
                          {renderStars(stars5)}
                          <span className="ml-2 text-sm text-gray-600">
                            ({ratingText})
                          </span>
                        </div>

                        <span className="text-sm text-gray-500">
                          {formatDate(created)}
                        </span>

                        {(review.propertyName || review.propertySlug) && (
                          <span className="text-sm text-gray-500">
                            {review.propertyName || review.propertySlug}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {review.status === "pending" && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprove(id)}
                          disabled={actionLoading === id}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === id
                            ? "Folyamatban..."
                            : "Jóváhagyás"}
                        </button>
                        <button
                          onClick={() => handleReject(id)}
                          disabled={actionLoading === id}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === id
                            ? "Folyamatban..."
                            : "Elutasítás"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-gray-700 text-sm leading-relaxed">
                    {text || (
                      <span className="italic text-gray-500">
                        Nincs szöveges értékelés.
                      </span>
                    )}
                  </div>

                  {review.source && (
                    <div className="text-xs text-gray-500">
                      Forrás: {sourceLabel(review.source)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Oldal {currentPage} / {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Előző
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Következő
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
