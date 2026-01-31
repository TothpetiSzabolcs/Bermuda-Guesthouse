import React, { useState } from "react";
import { useRooms } from "../hooks/useRooms";
import { useI18n } from "../i18n/useI18n";
import RoomCard from "./RoomCard";
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
            return (
              <RoomCard
                key={key}
                room={room}
                onBookingClick={setSelectedRoom}
              />
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
