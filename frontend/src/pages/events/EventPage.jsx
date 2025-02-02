import React from 'react';
import EventCard from '../../components/events/EventCard';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios'; 

const EventsPage = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await axiosInstance.get('/events');
      return response.data;
    },
  });

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error fetching events: {error.message}</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Events</h1>

      <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {events.map((event) => (
          <EventCard key={event._id} eventId={event._id} /> 
        ))}
      </div>
    </div>
  );
};

export default EventsPage;