import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
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
import { useRoom } from "../hooks/useRoom";
import { useI18n } from "../i18n/useI18n";
import { cld } from "../utils/cloudinary";
import BookingModal from "./BookingModal";
import SEO from "../components/SEO";
import Header from "../components/header";
import Footer from "../components/Footer";
import { getDisplayPrice } from "../utils/price";

// Autoplay interval constant (5 seconds)
const AUTOPLAY_INTERVAL = 5000;

const RoomDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { t, lang } = useI18n();

  const { data: room, loading, error } = useRoom(slug, { lang });

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

  const p = getDisplayPrice(room);

  const images = useMemo(() => {
    const arr = [];

    const pushUrl = (val) => {
      if (!val) return;
      if (typeof val === "string") arr.push(val);
      else {
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

    return Array.from(new Set(arr.filter(Boolean)));
  }, [room]);

  const hasMany = images.length > 1;

  // Apply query parameter for initial image index (only once, before user interaction)
  useEffect(() => {
    if (queryParamApplied || loading || images.length === 0) return;

    const imgParam = searchParams.get("img");
    if (imgParam !== null) {
      const parsedIndex = parseInt(imgParam, 10);
      if (!isNaN(parsedIndex)) {
        const clampedIndex = Math.max(
          0,
          Math.min(parsedIndex, images.length - 1),
        );
        setActiveImg(clampedIndex);
        setImageLoading(true);
        setImageError(false);
      }
    }
    setQueryParamApplied(true);
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
  }, [slug]);

  // Autoplay helper functions
  const startAutoplay = useCallback(() => {
    if (!hasMany || isHovered || document.visibilityState !== "visible") return;

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
    if (!isHovered && document.visibilityState === "visible") {
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
      if (document.visibilityState === "visible" && !isHovered && hasMany) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isHovered, hasMany, startAutoplay, stopAutoplay]);

  // Main autoplay effect
  useEffect(() => {
    if (!hasMany) {
      stopAutoplay();
      return;
    }

    if (!isHovered && document.visibilityState === "visible") {
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

    if (isLeftSwipe) goNext();
    if (isRightSwipe) goPrev();

    resetAutoplay();
  };

  // Lazy preload functionality
  const preloadImage = useCallback((imageUrl) => {
    if (!imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const nextIndex = (activeImg + 1) % images.length;
    const prevIndex = (activeImg - 1 + images.length) % images.length;

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
  }, [hasMany, goPrev, goNext]);

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

  const guests = room.guests ?? room.capacity ?? 0;
  const description = room.description || t("rooms.placeholderDescription");

  const heroRaw = images[activeImg] || room?.image || null;
  const hero1200 = heroRaw ? cld(heroRaw, "f_auto,q_auto,w_1200") : null;
  const hero800 = heroRaw ? cld(heroRaw, "f_auto,q_auto,w_800") : null;
  const hero480 = heroRaw ? cld(heroRaw, "f_auto,q_auto,w_480") : null;

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

      <Header />

      <section className="scroll-mt-24 py-30 bg-white overflow-x-hidden">
        {/* container: mobilon kisebb padding, desktopon nagyobb */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 w-full overflow-x-hidden">
          {/* Back button: mobilon kisebb margó */}
          <Link
            to="/#rooms"
            className="inline-flex items-center text-gray-600 hover:text-green-600 font-medium mb-4 sm:mb-6 lg:mb-8 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            {t("common.backToHome") || "Vissza a szobákhoz"}
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full overflow-x-hidden">
            {/* Image section (CAROUSEL) */}
            <div
              className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] 2xl:h-[520px] w-full"
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
                    alt={t("rooms.carousel.imageAlt", {
                      roomName: room.name,
                      index: activeImg + 1,
                      total: images.length,
                    })}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoading ? "opacity-0" : "opacity-100"
                    }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />

                  {/* Error fallback UI */}
                  {imageError && (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🖼️</div>
                        <p>{t("common.imageLoadError")}</p>
                      </div>
                    </div>
                  )}

                  {/* Left / Right arrows */}
                  {hasMany && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        aria-label={t("rooms.carousel.prev")}
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 sm:p-2 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70 z-20"
                      >
                        <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={goNext}
                        aria-label={t("rooms.carousel.next")}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 sm:p-2 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70 z-20"
                      >
                        <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>

                      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs text-white z-20">
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
              {typeof p.amount === "number" && (
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium flex items-center shadow z-10 max-w-[calc(100%-2rem)] sm:max-w-none">
                  <FiTag className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 flex-shrink-0" />

                  <span className="truncate">
                    {p.isPromo ? (
                      <>
                        <span className="line-through opacity-80">
                          {p.baseAmount} Ft
                        </span>
                        <span className="ml-2 font-semibold">
                          {p.amount} Ft
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">{p.amount} Ft</span>
                    )}
                    <span className="ml-2 opacity-90">
                      {room?.price?.unit === "room_night"
                        ? t("rooms.price.unit")
                        : t("common.pricePerPersonPerNight")}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Content section */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 break-words pr-2">
                    {room.name}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <FiUsers className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-base sm:text-lg truncate">
                      {guests} {t("common.guests")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookingClick}
                  className="mt-2 md:mt-0 w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex-shrink-0"
                >
                  {t("rooms.bookCta")}
                </button>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  {t("rooms.description") || "Leírás"}
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {description}
                </p>
              </div>

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {t("rooms.amenities")}
                  </h2>
                  <div className="flex flex-wrap gap-2 w-full">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm break-all max-w-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard amenities icons */}
              <div className="mb-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  {t("rooms.standardAmenities") || "Alap felszereltség"}
                </h2>

                {/* SE-n wrap + gap, ne overflow */}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-gray-600 text-xs sm:text-sm w-full">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                    <FiWifi className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">WiFi</span>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                    <FiCoffee className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">Kávé/Tea</span>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                    <MdTv className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">TV</span>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                    <MdOutlineBathroom className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">
                      {t("rooms.privateBathroom")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* end card */}
        </div>
      </section>

      <BookingModal
        isOpen={!!selectedRoom}
        onClose={handleBookingClose}
        mode="direct"
        initialRoom={selectedRoom}
      />
      <Footer />
    </>
  );
};

export default RoomDetail;
