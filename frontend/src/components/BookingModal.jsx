import React, { useState } from "react";
import { useI18n } from "../i18n/useI18n";
import { useRooms } from "../hooks/useRooms";
import BookingForm from "./BookingForm";
import Modal from "./Modal";

const BookingModal = ({ isOpen, onClose, mode = "direct", initialRoom = null }) => {
  const { t, lang } = useI18n();
  const [selectedRoom, setSelectedRoom] = useState(initialRoom);
  const { data: rooms, loading, error } = useRooms("bermuda-vendeghaz", { lang });

  // Reset selected room when modal opens/closes with different mode
  React.useEffect(() => {
    if (isOpen) {
      setSelectedRoom(initialRoom);
    }
  }, [isOpen, initialRoom, mode]);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleBackToPicker = () => {
    setSelectedRoom(null);
  };

  const handleClose = () => {
    setSelectedRoom(null);
    onClose();
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={t("booking.picker.title")}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={t("booking.picker.title")}>
        <div className="text-center py-8">
          <p className="text-red-600">{t("common.error")}</p>
          <button
            onClick={handleClose}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {t("common.close")}
          </button>
        </div>
      </Modal>
    );
  }

  // If we have a selected room or mode is 'direct' with initialRoom, show booking form
  if (selectedRoom || (mode === "direct" && initialRoom)) {
    const roomToShow = selectedRoom || initialRoom;
    
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title={roomToShow.name || t("booking.title")}
      >
        {mode === "picker" && (
          <div className="mb-4">
            <button
              onClick={handleBackToPicker}
              className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t("booking.picker.backToPicker")}
            </button>
          </div>
        )}
        <BookingForm room={roomToShow} onClose={handleClose} />
      </Modal>
    );
  }

  // Show room picker (only for header mode)
  if (mode === "picker") {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={t("booking.picker.title")}>
        <div className="space-y-3 sm:space-y-4">
          {rooms?.map((room) => {
            const key = room.id || room._id || room.slug;
            return (
              <button
                key={key}
                onClick={() => handleRoomSelect(room)}
                className="w-full text-left p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-green-700 truncate">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {room.capacity || room.guests || 0} {t("common.guests")}
                    </p>
                    {room.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {room.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-2 sm:ml-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>
    );
  }

  return null;
};

export default BookingModal;