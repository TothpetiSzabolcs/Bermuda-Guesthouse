import React, { useState, useCallback } from "react";
import { FiUsers, FiWifi, FiCoffee, FiTag } from "react-icons/fi";
import { MdTv, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Link } from "react-router-dom";
import { MdOutlineBathroom } from "react-icons/md";
import { FaKitchenSet } from "react-icons/fa6";
import { useI18n } from "../i18n/useI18n";
import { cld } from "../utils/cloudinary";

const RoomCard = React.memo(({ room, onBookingClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useI18n();


  const images = room.images || [];
  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;
  
  // Get current image or fallback to single image field
  const currentImage = hasImages ? images[currentImageIndex] : null;
  const fallbackImage = room.image || null;
  const imgSrcRaw = currentImage?.url || fallbackImage;

  const img800 = cld(imgSrcRaw, "f_auto,q_auto,w_800");
  const img600 = cld(imgSrcRaw, "f_auto,q_auto,w_600");
  const img400 = cld(imgSrcRaw, "f_auto,q_auto,w_400");

  const guests = room.guests ?? room.capacity ?? 0;

  const handlePrevImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNextImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="relative aspect-[4/3] bg-gray-100">
        {imgSrcRaw ? (
          <>
            <img
              src={img800}
              srcSet={`${img400} 400w, ${img600} 600w, ${img800} 800w`}
              sizes="(max-width: 640px) 400px, (max-width: 1024px) 600px, 800px"
              alt={
                currentImage?.alt ||
                t("rooms.carousel.imageAlt", {
                  roomName: room.name,
                  index: currentImageIndex + 1,
                  total: images.length || 1,
                })
              }
              className="w-full h-full object-cover hover:scale-105 transition-all duration-500"
              loading="lazy"
              decoding="async"
            />
            
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
                  aria-label={t("rooms.carousel.prev")}
                >
                  <MdChevronLeft className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
                  aria-label={t("rooms.carousel.next")}
                >
                  <MdChevronRight className="w-5 h-5" />
                </button>
                
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? "bg-white w-6"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={t("rooms.carousel.goToImage", { index: index + 1 })}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            {t("common.noImage")}
          </div>
        )}

        {/* ár badge (ha van ár) */}
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <FiTag className="w-4 h-4 mr-1" />
          {t("rooms.price.amount")} {t("rooms.price.unit")}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-gray-900">
            {room.name}
          </h3>
          <div className="flex items-center text-gray-600">
            <FiUsers className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {guests} {t("common.guests")}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          {room.description || t("rooms.placeholderDescription")}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {(room.amenities ?? []).map((amenity, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {amenity}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-3 text-gray-600">
            <FiWifi className="w-5 h-5" />
            <FiCoffee className="w-5 h-5" />
            <MdTv className="w-5 h-5" />
            <MdOutlineBathroom className="w-5 h-5" />
            <FaKitchenSet className="w-5 h-5" />
          </div>
        </div>

        <div className="flex space-x-3">
          <Link
            to={`/rooms/${room.slug || room.id || room._id}?img=${currentImageIndex}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors duration-200 text-center"
          >
            {t("common.viewDetails") || "Megtekintés"}
          </Link>
          <button
            onClick={() => onBookingClick(room)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            {t("rooms.bookCta")}
          </button>
        </div>
      </div>
    </div>
  );
});

RoomCard.displayName = "RoomCard";

export default RoomCard;