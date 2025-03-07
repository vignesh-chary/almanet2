import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";

const EventCard = ({ eventId }) => {
  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="w-80 bg-gray-200 animate-pulse rounded-lg shadow-lg">
        <div className="h-48 bg-gray-300 rounded-t-lg"></div>
        <div className="p-5 space-y-4">
          <div className="h-6 bg-gray-400 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-10 bg-gray-400 rounded mt-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 p-5 text-center text-red-500 bg-red-100 rounded-lg shadow-md">
        Error loading event.
      </div>
    );
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 overflow-hidden">
      <Link to={`/events/${event?._id}`} className="block">
        <figure>
          <img
            src={event?.eventPoster || "/placeholder-event.jpg"}
            alt={event?.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </figure>
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{event?.title}</h2>

          <div className="flex items-center gap-3 text-gray-600">
            <Calendar size={20} />
            <p className="text-sm">{new Date(event?.date).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <MapPin size={20} />
            <p className="text-sm truncate">{event?.location}</p>
          </div>

          <div className="pt-4">
            <button className="w-full py-3 px-5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              View Details
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;
