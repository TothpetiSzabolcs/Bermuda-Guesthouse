import { useState, useEffect, useCallback } from "react";
import SEO from "../../components/SEO";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        page: currentPage,
        limit: 20,
      });
      
      const response = await fetch(`/api/admin/reviews?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch reviews");
      
      const data = await response.json();
      setReviews(data.reviews);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  const handleApprove = async (reviewId) => {
    try {
      setActionLoading(reviewId);
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to approve review");
      
      fetchReviews(); // Refresh list
    } catch (error) {
      console.error("Error approving review:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId) => {
    try {
      setActionLoading(reviewId);
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to reject review");
      
      fetchReviews(); // Refresh list
    } catch (error) {
      console.error("Error rejecting review:", error);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("hu-HU", {
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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <>
      <SEO title="Vélemények kezelése – Admin" noindex />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vélemények kezelése</h1>
          <p className="mt-1 text-sm text-gray-600">
            Itt moderálhatja a beérkezett véleményeket.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
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

        {/* Reviews list */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Betöltés...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Nincsenek vélemények a kiválasztott szűrővel.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-lg p-4 space-y-3 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{review.name || "Névtelen"}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {review.status === "pending" && "Függőben"}
                        {review.status === "approved" && "Jóváhagyott"}
                        {review.status === "rejected" && "Elutasított"}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                      {review.propertyName && (
                        <span className="text-sm text-gray-500">
                          {review.propertyName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {review.status === "pending" && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {actionLoading === review.id ? "Folyamatban..." : "Jóváhagyás"}
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={actionLoading === review.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {actionLoading === review.id ? "Folyamatban..." : "Elutasítás"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-gray-700 text-sm leading-relaxed">
                  {review.text}
                </div>

                {review.source && (
                  <div className="text-xs text-gray-500">
                    Forrás: {review.source}
                  </div>
                )}
              </div>
            ))}
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
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Előző
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
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