import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom";

const EventCard = ({ eventId }) => {
  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data;
    },
  });

  // Handle loading and error states
  if (isLoading) return <div>Loading event...</div>;
  if (error) return <div>Error fetching event details: {error.message}</div>;

  return (
    <div className="card card-compact w-96 bg-base-100 shadow-xl">
      <figure>
        <img
          src={event?.eventPoster} // Use optional chaining to handle potential undefined eventPoster
          alt={event?.title}
          className="rounded-lg"
          loading="lazy" // Native lazy loading
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{event?.title}</h2>
        <p>{event?.date}</p>
        <p>{event?.location}</p>
        <div className="card-actions justify-end">
          <Link to={`/events/${event?._id}`}> {/* Fixed Link usage */}
            <button className="btn btn-primary">View Details</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
