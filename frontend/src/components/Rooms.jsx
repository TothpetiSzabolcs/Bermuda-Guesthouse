import React, { useState } from "react";
import { FiUsers, FiWifi, FiCoffee } from "react-icons/fi";
import { MdTv } from "react-icons/md";
import { useRooms } from "../hooks/useRooms";
import { useI18n } from "../i18n/useI18n";
import { cld } from "../utils/cloudinary";
import { Link } from "react-router-dom";
import { MdOutlineBathroom } from "react-icons/md";
import { FaKitchenSet } from "react-icons/fa6";
import BookingModal from "./BookingModal";

const Rooms = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { t } = useI18n();
  const { data: rooms, loading, error } = useRooms("bermuda-vendeghaz", {});

  if (loading)
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">{t("common.loading")}</div>
      </section>
    );

  if (error)
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">{t("common.error")}</div>
      </section>
    );

  return (
    <section
      id="rooms"
      className="relative isolate scroll-mt-16 mt-6 md:mt-10 py-20 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("rooms.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("rooms.lead")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(rooms ?? []).map((room) => {
            const key = room.id || room._id || room.slug;
            const imgSrcRaw = room.image || room.images?.[0]?.url || null;
            const img1200 = cld(imgSrcRaw, "f_auto,q_auto,w_1200");
            const img800 = cld(imgSrcRaw, "f_auto,q_auto,w_800");
            const img480 = cld(imgSrcRaw, "f_auto,q_auto,w_480");
            const guests = room.guests ?? room.capacity ?? 0;

            return (
              <div
                key={key}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative">
                  {imgSrcRaw ? (
                    <img
                      src={img1200}
                      srcSet={`${img480} 480w, ${img800} 800w, ${img1200} 1200w`}
                      sizes="(max-width: 640px) 480px, (max-width: 1024px) 800px, 1200px"
                      alt={room.name}
                      className="w-full h-64 object-cover md:transition-transform md:duration-300 md:group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                      {t("common.noImage")}
                    </div>
                  )}

                  {/* ár badge (ha van ár) */}
                  {typeof room.price === "number" && (
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ${room.price}/{t("common.pricePerNight")}
                    </div>
                  )}
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
                      to={`/rooms/${room.slug || room.id || room._id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors duration-200 text-center"
                    >
                      {t("common.viewDetails") || "Megtekintés"}
                    </Link>
                    <button
                      onClick={() => setSelectedRoom(room)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      {t("rooms.bookCta")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <BookingModal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          mode="direct"
          initialRoom={selectedRoom}
        />
      </div>
    </section>
  );
};

export default Rooms;
