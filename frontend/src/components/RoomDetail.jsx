import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiUsers,
  FiWifi,
  FiCoffee,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
} from "react-icons/fi";
import { MdTv, MdOutlineBathroom } from "react-icons/md";
import { FaKitchenSet } from "react-icons/fa6";
import { useRoom } from "../hooks/useRoom";
import { useI18n } from "../i18n/useI18n";
import { cld } from "../utils/cloudinary";
import BookingModal from "./BookingModal";
import SEO from "../components/SEO";

// Autoplay interval constant (5 seconds)
const AUTOPLAY_INTERVAL = 5000;

const RoomDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const { data: room, loading, error, status } = useRoom(slug, { lang });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [queryParamApplied, setQueryParamApplied] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Image loading states
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Autoplay state
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimerRef = useRef(null);


  useEffect(() => {
    if (loading) return;
    if (status === 404) navigate("/", { replace: true });
  }, [loading, status, navigate]);

  // Egységes képlista: room.image + room.images (string vagy {url})
  const images = useMemo(() => {
    const arr = [];
  
    const pushUrl = (val) => {
      if (!val) return;
      if (typeof val === "string") arr.push(val);
      else {
        // backend / cloudinary féle eltérések
        const url =
          val.url ||
          val.secure_url ||
          val.src ||
          val.path ||
          (val.public_id ? val.public_id : null);
        if (url) arr.push(url);
      }
    };
  
    pushUrl(room?.image);
  
    if (Array.isArray(room?.images)) {
      room.images.forEach(pushUrl);
    }
  
    // kiszűrjük az üreseket + duplikációt
    return Array.from(new Set(arr.filter(Boolean)));
  }, [room]);
  
  const hasMany = images.length > 1;

  // Apply query parameter for initial image index (only once, before user interaction)
  useEffect(() => {
    if (queryParamApplied || loading || images.length === 0) return;
    
    const imgParam = searchParams.get('img');
    if (imgParam !== null) {
      const parsedIndex = parseInt(imgParam, 10);
      if (!isNaN(parsedIndex)) {
        // Clamp index between 0 and images.length - 1
        const clampedIndex = Math.max(0, Math.min(parsedIndex, images.length - 1));
        setActiveImg(clampedIndex);
        setImageLoading(true);
        setImageError(false);
        setQueryParamApplied(true);
      }
    }
  }, [images.length, loading, queryParamApplied, searchParams]);

  // Initialize image loading states when room data loads
  useEffect(() => {
    if (!loading && room && images.length > 0) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [loading, room, images.length]);

  // slug váltáskor vissza az első képre és reset query param state
  useEffect(() => {
    setActiveImg(0);
    setQueryParamApplied(false);
    setImageLoading(true);
    setImageError(false);
  }, [images.length]);

  // Autoplay helper functions
  const startAutoplay = useCallback(() => {
    if (!hasMany || isHovered || document.visibilityState !== 'visible') return;
    
    clearInterval(autoplayTimerRef.current);
    autoplayTimerRef.current = setInterval(() => {
      setActiveImg((i) => (i + 1) % images.length);
      setImageLoading(true);
      setImageError(false);
    }, AUTOPLAY_INTERVAL);
  }, [hasMany, isHovered, images.length]);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const resetAutoplay = useCallback(() => {
    stopAutoplay();
    if (!isHovered && document.visibilityState === 'visible') {
      startAutoplay();
    }
  }, [stopAutoplay, startAutoplay, isHovered]);

  const goPrev = useCallback(() => {
    if (!hasMany) return;
    setActiveImg((i) => (i - 1 + images.length) % images.length);
    setImageLoading(true);
    setImageError(false);
    resetAutoplay();
  }, [hasMany, images.length, resetAutoplay]);

  const goNext = useCallback(() => {
    if (!hasMany) return;
    setActiveImg((i) => (i + 1) % images.length);
    setImageLoading(true);
    setImageError(false);
    resetAutoplay();
  }, [hasMany, images.length, resetAutoplay]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      stopAutoplay();
    };
  }, [stopAutoplay]);

  // Visibility API effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isHovered && hasMany) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHovered, hasMany, startAutoplay, stopAutoplay]);

  // Main autoplay effect
  useEffect(() => {
    if (!hasMany) {
      stopAutoplay();
      return;
    }

    if (!isHovered && document.visibilityState === 'visible') {
      startAutoplay();
    } else {
      stopAutoplay();
    }

    return () => {
      stopAutoplay();
    };
  }, [hasMany, isHovered, startAutoplay, stopAutoplay]);

  // Swipe gesture handlers
  const minSwipeDistance = 40;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !hasMany) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goNext();
    }
    if (isRightSwipe) {
      goPrev();
    }
    
    // Reset autoplay on any swipe action
    resetAutoplay();
  };

  // Lazy preload functionality
  const preloadImage = useCallback((imageUrl) => {
    if (!imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
  }, []);

  // Preload next and previous images when activeImg changes
  useEffect(() => {
    if (images.length <= 1) return;

    const nextIndex = (activeImg + 1) % images.length;
    const prevIndex = (activeImg - 1 + images.length) % images.length;

    // Preload next and previous images with w_1200 transformation
    preloadImage(cld(images[nextIndex], "f_auto,q_auto,w_1200"));
    preloadImage(cld(images[prevIndex], "f_auto,q_auto,w_1200"));
  }, [activeImg, images, preloadImage]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  // Billentyű lapozás (← →)
  useEffect(() => {
    if (!hasMany) return;

    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasMany, images.length, goPrev, goNext]);

  const handleBookingClick = () => setSelectedRoom(room);
  const handleBookingClose = () => setSelectedRoom(null);

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </section>
    );
  }

  if (error || !room) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-600">{t("common.error")}</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {t("common.backToHome") || "Vissza a főoldalra"}
          </Link>
        </div>
      </section>
    );
  }

  console.log("ROOM images raw:", room.images);
  console.log("ROOM image:", room.image);
  console.log("NORMALIZED images:", images);

  const guests = room.guests ?? room.capacity ?? 0;
  const description = room.description || t("rooms.placeholderDescription");

  // HERO kép most már az images[activeImg]-ból jön
  const heroRaw = images[activeImg] || room?.image || null;
  const hero1200 = heroRaw ? cld(heroRaw, "f_auto,q_auto,w_1200") : null;
  const hero800 = heroRaw ? cld(heroRaw, "f_auto,q_auto,w_800") : null;
  const hero480 = heroRaw ? cld(heroRaw, "f_auto,q_auto,w_480") : null;

  // SEO-hoz stabilan az első kép
  const ogRaw = images[0] || null;

  return (
    <>
      <SEO
        title={`${room.name} – ${t("nav.rooms")} | Bermuda Vendégház`}
        description={
          (typeof description === "string" ? description.slice(0, 155) : "") ||
          "Szoba részletek, felszereltség és foglalás – Bermuda Vendégház."
        }
        canonicalUrl={`https://bermuda-vendeghaz.hu/rooms/${slug}`}
        ogImage={ogRaw ? cld(ogRaw, "f_auto,q_auto,w_1200") : "/og-image.jpg"}
      />

      <section className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back button */}
          <Link
            to="/#rooms"
            className="inline-flex items-center text-gray-600 hover:text-green-600 font-medium mb-8 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            {t("common.backToHome") || "Vissza a szobákhoz"}
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Image section (CAROUSEL) */}
            <div 
              className="relative h-96 md:h-[500px]"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {heroRaw ? (
                <>
                  {/* Skeleton overlay */}
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-300 animate-pulse" />
                  )}
                  
                  <img
                    src={hero1200}
                    srcSet={`${hero480} 480w, ${hero800} 800w, ${hero1200} 1200w`}
                    sizes="(max-width: 640px) 480px, (max-width: 1024px) 800px, 1200px"
                    alt={`${room.name} - ${activeImg + 1}/${images.length}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />

                  {/* Error fallback UI */}
                  {imageError && (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📷</div>
                        <p>{t("common.imageLoadError") || "Kép betöltése sikertelen"}</p>
                      </div>
                    </div>
                  )}

                  {/* Left / Right arrows */}
                  {hasMany && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70"
                      >
                        <FiChevronLeft className="h-6 w-6" />
                      </button>

                      <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70"
                      >
                        <FiChevronRight className="h-6 w-6" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs text-white">
                        {activeImg + 1}/{images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {t("common.noImage")}
                </div>
              )}

              {/* Price badge */}
              <div className="absolute top-6 right-6 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <FiTag className="w-4 h-4 mr-1" />
                9000 Ft / {t("common.pricePerPersonPerNight")}
              </div>
            </div>

            {/* Content section */}
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {room.name}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <FiUsers className="w-5 h-5 mr-2" />
                    <span className="text-lg">
                      {guests} {t("common.guests")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookingClick}
                  className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  {t("rooms.bookCta")}
                </button>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("rooms.description") || "Leírás"}
                </h2>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {t("rooms.amenities")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard amenities icons */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("rooms.standardAmenities") || "Alap felszereltség"}
                </h2>
                <div className="flex space-x-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FiWifi className="w-6 h-6" />
                    <span>WiFi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCoffee className="w-6 h-6" />
                    <span>Kávé/Tea</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MdTv className="w-6 h-6" />
                    <span>TV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MdOutlineBathroom className="w-6 h-6" />
                    <span>{t("rooms.privateBathroom")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaKitchenSet className="w-6 h-6" />
                    <span>Konyhai rész</span>
                  </div>
                </div>
              </div>              
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        isOpen={!!selectedRoom}
        onClose={handleBookingClose}
        mode="direct"
        initialRoom={selectedRoom}
      />
    </>
  );
};

export default RoomDetail;
