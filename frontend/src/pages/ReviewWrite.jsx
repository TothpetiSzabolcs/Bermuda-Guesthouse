import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function ReviewWrite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("t");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 5,
    text: "",
    author: "",
  });

  useEffect(() => {
    if (!token) {
      setError("missing_token");
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/reviews/web/validate?t=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (!data.valid) {
          setError(data.error || "invalid_token");
        } else {
          setBooking(data.booking);
        }
    } catch {
      setError("server_error");
    } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) return;

    setSubmitting(true);
    
    try {
      const payload = {
        token,                
        rating: formData.rating,
        text: formData.text,
        name: formData.author, 
      };
      
      const response = await fetch(`/api/reviews/web/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || "submit_error");
      }
    } catch {
      setError("submit_error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ellenőrzés...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessages = {
      missing_token: "Hiányzó token. Ellenőrizze a linket.",
      invalid_token: "Érvénytelen vagy lejárt link. Kérjen új értékelési linket.",
      server_error: "Szerverhiba. Próbálja később.",
      submit_error: "Hiba az értékelés mentése közben. Próbálja újra.",
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hiba történt</h1>
          <p className="text-gray-600 mb-6">{errorMessages[error] || "Ismeretlen hiba."}</p>
          <a 
            href="/reviews" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Értékelések megtekintése
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Köszönjük!</h1>
          <p className="text-gray-600">Értékelését megkaptuk. Moderálás után megjelenik az oldalon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Értékelés írása
          </h1>
          <p className="text-gray-600 mb-6">
            {booking?.propertyName} • Foglalás kód: {booking?.code}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Értékelés *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="text-3xl transition-colors focus:outline-none"
                  >
                    <span className={star <= formData.rating ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Értékelés szövege *
              </label>
              <textarea
                id="text"
                rows="5"
                minLength={20}
                required
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Legalább 20 karakter..."
              />
              <p className="text-sm text-gray-500 mt-1">
              {formData.text.length} karakter (min. 20)
              </p>
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Név (opcionális)
              </label>
              <input
                type="text"
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Az Ön neve..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || formData.text.length < 20}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Küldés..." : "Értékelés küldése"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}