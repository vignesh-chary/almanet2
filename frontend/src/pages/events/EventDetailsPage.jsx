import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios'; 

const EventDetailsPage = () => {
  const { eventId } = useParams(); 
  const queryClient = useQueryClient();

  // Get the logged-in user's ID
  const { data: authUser } = useQuery({ queryKey: ["authUser"] }); 
  const userId = authUser?._id; // Use optional chaining to handle potential null/undefined

  // Fetch event details
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['eventDetails', eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId, 
  });

  // Mutation for registering to the event
  const { mutate, isLoading: isRegistering, error: registerError } = useMutation({
    mutationFn: async () => {
      console.log('in mutate fn',eventId);
      const response = await axiosInstance.post(`/events/${eventId}/register`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['eventDetails', eventId], (prev) => ({
        ...prev,
        ...data.event,
      }));
      console.log('Successfully registered for the event!');
    },
    onError: (error) => {
      console.error('Error registering for the event:', error);
    },
  });

  if (!eventId) return <div>Invalid event ID.</div>;
  if (isLoading) return <div>Loading event details...</div>;
  if (error) return <div>Error fetching event details: {error.message}</div>;

  return (
    <div className="container mx-auto px-4">
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>Date: {event.date}</p>
      <p>Time: {event.time}</p>
      <p>Location: {event.location}</p>

      <button 
        disabled={isRegistering || event?.participants?.includes(userId)} 
        onClick={() => mutate(eventId)}
      >
        {isRegistering ? 'Registering...' : event?.participants?.includes(userId) ? 'Attending' : 'Attend'}
      </button>

      {registerError && <p style={{ color: 'red' }}>{registerError.message}</p>}
    </div>
  );
};

export default EventDetailsPage;