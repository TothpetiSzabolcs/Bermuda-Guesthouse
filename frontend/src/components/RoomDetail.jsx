import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiUsers, FiWifi, FiCoffee, FiArrowLeft } from "react-icons/fi";
import { MdTv } from "react-icons/md";
import { MdOutlineBathroom } from "react-icons/md";
import { FaKitchenSet } from "react-icons/fa6";
import { useRooms } from "../hooks/useRooms";
import { useI18n } from "../i18n/useI18n";
import { cld } from "../utils/cloudinary";
import BookingModal from "./BookingModal";
import SEO from "../components/SEO";

const RoomDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const {
    data: rooms,
    loading,
    error,
  } = useRooms("bermuda-vendeghaz", { lang });
  const [selectedRoom, setSelectedRoom] = useState(null);

  const room = rooms?.find(
    (r) => r.slug === slug || r.id === slug || r._id === slug,
  );

  useEffect(() => {
    if (rooms && !room) {
      navigate("/", { replace: true });
    }
  }, [rooms, room, navigate]);

  const handleBookingClick = () => {
    setSelectedRoom(room);
  };

  const handleBookingClose = () => {
    setSelectedRoom(null);
  };

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

  const imgSrcRaw = room.image || room.images?.[0]?.url || null;
  const img1200 = cld(imgSrcRaw, "f_auto,q_auto,w_1200");
  const img800 = cld(imgSrcRaw, "f_auto,q_auto,w_800");
  const img480 = cld(imgSrcRaw, "f_auto,q_auto,w_480");
  const guests = room.guests ?? room.capacity ?? 0;
  const description = room.description || t("rooms.placeholderDescription");

  return (
    <>
      <SEO
        title={`${room.name} – ${t("nav.rooms")} | Bermuda Vendégház`}
        description={
          (typeof description === "string" ? description.slice(0, 155) : "") ||
          "Szoba részletek, felszereltség és foglalás – Bermuda Vendégház."
        }
        canonicalUrl={`https://bermuda-vendeghaz.hu/rooms/${slug}`}
        ogImage={
          imgSrcRaw ? cld(imgSrcRaw, "f_auto,q_auto,w_1200") : "/og-image.jpg"
        }
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
            {/* Image section */}
            <div className="relative h-96 md:h-[500px]">
              {imgSrcRaw ? (
                <img
                  src={img1200}
                  srcSet={`${img480} 480w, ${img800} 800w, ${img1200} 1200w`}
                  sizes="(max-width: 640px) 480px, (max-width: 1024px) 800px, 1200px"
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {t("common.noImage")}
                </div>
              )}

              {/* Price badge */}
              {typeof room.price === "number" && (
                <div className="absolute top-6 right-6 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  ${room.price}/{t("common.pricePerNight")}
                </div>
              )}
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

              {/* Additional images if available */}
              {room.images && room.images.length > 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {t("rooms.morePhotos") || "További képek"}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {room.images.slice(1).map((image, index) => {
                      const imgSrc = image.url || image;
                      const img400 = cld(imgSrc, "f_auto,q_auto,w_400");
                      const img800 = cld(imgSrc, "f_auto,q_auto,w_800");

                      return (
                        <div
                          key={index}
                          className="aspect-square overflow-hidden rounded-lg"
                        >
                          <img
                            src={img400}
                            srcSet={`${img400} 400w, ${img800} 800w`}
                            sizes="(max-width: 640px) 400px, 800px"
                            alt={`${room.name} - ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
