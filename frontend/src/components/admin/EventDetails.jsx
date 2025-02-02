import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import EventForm from './EventForm';

const EventDetails = () => {
  const { eventId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch event details
  const { isLoading, error, data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data;
    },
  });

  // Fetch event participants
  const { isLoading: isLoadingParticipants, data: participants } = useQuery({
    queryKey: ['eventParticipants', eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/admin/events/${eventId}/rsvps`);
      return response.data.participants;
    },
    enabled: !!eventId, // Ensure this runs only when eventId is available
  });

  const { mutate: updateEvent, isLoading: isUpdating } = useMutation({
    mutationFn: (updatedEvent) =>
      axiosInstance.put(`/admin/events/${eventId}`, updatedEvent).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['event', eventId]);
      setIsEditing(false);
    },
  });

  const { mutate: deleteEvent, isLoading: isDeleting } = useMutation({
    mutationFn: () => axiosInstance.delete(`/admin/events/${eventId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['event', eventId]);
      navigate('/admin/events');
    },
  });

  const handleEdit = () => setIsEditing(true);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent();
    }
  };

  const formatDate = (date) => {
    const formattedDate = new Date(date);
    return isNaN(formattedDate) ? 'Invalid Date' : formattedDate.toLocaleDateString();
  };

  if (isLoading) {
    return <div>Loading event details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error fetching event</strong>
        <span className="block sm:inline">{error.message}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      {isEditing ? (
        <EventForm initialValues={event} onSubmit={(updatedData) => updateEvent(updatedData)} />
      ) : (
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
          <p>{event.description}</p>
          <p>
            {formatDate(event.date)} at {event.time}
          </p>
          <p>{event.location}</p>
          <div className="flex mt-4 space-x-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Participants Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Participants</h3>
        {isLoadingParticipants ? (
          <p>Loading participants...</p>
        ) : participants && participants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant) => (
              <div
                key={participant._id}
                className="border rounded-lg shadow p-4 bg-gray-100"
              >
                <h4 className="text-lg font-bold">{participant.name}</h4>
                <p className="text-sm text-gray-600">{participant.email}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No participants have registered for this event.</p>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
