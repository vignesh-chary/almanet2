import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const EventList = () => {
  const navigate = useNavigate();
  // Fetch all events from the API
  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/events");
      return response.data; // Ensure that the data is in the expected format (array)
    },
  });

  // If loading, display a loader
  if (isLoading)
    return (
      <div className="text-center p-4">
        <Loader size={30} className="animate-spin" />
      </div>
    );

  // If error occurs, display an error message
  if (isError)
    return <div className="text-center p-4">Failed to load events. Please try again later.</div>;

  // Ensure that 'data.events' is an array before calling filter
  const events = Array.isArray(data?.events) ? data.events : [];

  // Filter out duplicate events based on their unique identifier (_id)
  const uniqueEvents = events.filter(
    (event, index, self) => index === self.findIndex((e) => e._id === event._id)
  );

  // Navigate to the Create Event page
  const handleCreateEvent = () => {
    navigate("/admin/events/create");
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCreateEvent}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create Event
      </button>

      {uniqueEvents.map((event) => (
        <div key={event._id} className="bg-secondary rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {/* Check if event.organizer exists before rendering the profile */}
              {event.organizer && (
                <Link to={`/profile/${event.organizer.username}`}>
                  <img
                    src={event.organizer.profilePicture || "/avatar.png"}
                    alt={event.organizer.name}
                    className="size-10 rounded-full mr-3"
                  />
                </Link>
              )}

              <div>
                {/* Check if event.organizer exists before rendering the organizer's details */}
                {event.organizer && (
                  <Link to={`/profile/${event.organizer.username}`}>
                    <h3 className="font-semibold">{event.organizer.name}</h3>
                  </Link>
                )}
                <p className="text-xs text-info">{event.organizer?.headline}</p>
                <p className="text-xs text-info">
                  {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
          <p className="mb-4">{event.description}</p>
          {event.image && <img src={event.image} alt="Event content" className="rounded-lg w-full mb-4" />}

          <div className="flex justify-between text-info">
            <Link to={`/admin/events/${event._id}`} className="text-primary">
              View Event
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
