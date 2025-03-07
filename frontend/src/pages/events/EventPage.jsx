import React from "react";
import EventCard from "../../components/events/EventCard";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

const EventsPage = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await axiosInstance.get("/events");
      return response.data;
    },
  });

  if (isLoading)
    return (
      <div className="container mx-auto px-8 py-16">
        <h1 className="text-4xl font-extrabold mb-12 text-gray-900 text-center">
          Upcoming Events
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-14">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-lg h-72 animate-pulse shadow-lg"
            ></div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-8 py-16 text-center text-red-500">
        Error fetching events: {error.message}
      </div>
    );

  return (
    <div className="container mx-auto px-8 py-16">
      <h1 className="text-4xl font-extrabold mb-12 text-gray-900 text-center">
        Upcoming Events
      </h1>

      <h2 className="text-2xl font-semibold mb-10 text-gray-700 text-center">
        Recommended for You
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-14">
        {events.map((event) => (
          <EventCard key={event._id} eventId={event._id} />
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
