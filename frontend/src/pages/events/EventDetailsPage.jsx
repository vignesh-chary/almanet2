import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { Calendar, Clock, MapPin, User } from "lucide-react";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const queryClient = useQueryClient();

  // Get the logged-in user's ID
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const userId = authUser?._id;

  // Fetch event details
  const { data: event, isLoading, error } = useQuery({
    queryKey: ["eventDetails", eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });

  // Mutation for registering to the event
  const { mutate, isLoading: isRegistering, error: registerError } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(`/events/${eventId}/register`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["eventDetails", eventId], (prev) => ({
        ...prev,
        ...data.event,
      }));
      console.log("Successfully registered for the event!");
    },
    onError: (error) => {
      console.error("Error registering for the event:", error);
    },
  });

  if (!eventId) return <div>Invalid event ID.</div>;
  if (isLoading) return <div>Loading event details...</div>;
  if (error) return <div>Error fetching event details: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <img
          src={event.eventPoster}
          alt={event.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          <p className="text-gray-700 mb-6">{event.description}</p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={20} />
              <p>{event.date}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} />
              <p>{event.time}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={20} />
              <p>{event.location}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User size={20} />
              <p>{event.participants?.length || 0} attendees</p>
            </div>
          </div>

          <button
            disabled={isRegistering || event?.participants?.includes(userId)}
            onClick={() => mutate(eventId)}
            className={`w-full py-2 px-4 rounded-lg font-semibold ${
              event?.participants?.includes(userId)
                ? "bg-green-500 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } transition-colors duration-300`}
          >
            {isRegistering
              ? "Registering..."
              : event?.participants?.includes(userId)
              ? "Attending"
              : "Attend"}
          </button>

          {registerError && (
            <p className="text-red-500 mt-4">{registerError.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;