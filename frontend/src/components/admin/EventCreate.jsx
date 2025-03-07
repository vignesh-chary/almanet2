import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import EventForm from "./EventForm";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";

const EventCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: createEvent, isLoading } = useMutation({
    mutationFn: (newEvent) =>
      axiosInstance.post("/admin/events", newEvent).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      navigate("/admin/events");
    },
    onError: (error) => {
      setError(error.message);
      console.error("Error creating event:", error);
    },
  });

  const handleCreateEvent = (eventData) => {
    setIsSubmitting(true);
    createEvent(eventData);
  };

  return (
    <div className="p-4 ml-16">
      <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
      {error && (
        <div className="flex items-center gap-2 bg-red-100 text-red-600 p-3 rounded-lg mb-4">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
      <EventForm
        initialValues={{ title: "", description: "", date: "", time: "", location: "" }}
        onSubmit={handleCreateEvent}
        isLoading={isLoading}
      />
      {isLoading && (
        <div className="flex items-center gap-2 mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p>Creating event...</p>
        </div>
      )}
    </div>
  );
};

export default EventCreate;