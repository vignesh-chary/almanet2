import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  if (!event) {
    return (
      <div className="flex flex-col gap-3 pb-3">
        <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl bg-secondary" />
        <p className="text-text text-base font-medium leading-normal">Event not found</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Link
      to={`/events/${event._id}`}
      className="flex flex-col gap-3 pb-3 hover:opacity-90 transition-opacity"
    >
      <div
        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl relative"
        style={{
          backgroundImage: `url(${event.bannerImg || "/placeholder-event.jpg"})`,
          backgroundColor: event.bannerImg ? 'transparent' : '#f3f4f6'
        }}
      >
        {event.date && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {formatDate(event.date)}
          </div>
        )}
      </div>
      <div>
        <p className="text-text text-base font-medium leading-normal line-clamp-2">
          {event.title}
        </p>
        <p className="text-accent text-sm mt-1">
          {event.locationType === 'online' ? 'Online Event' : event.physicalLocation}
        </p>
      </div>
    </Link>
  );
};

export default EventCard;