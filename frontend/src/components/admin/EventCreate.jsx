import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import EventForm from './EventForm';

const EventCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Initialize query client to manage cache invalidation

  const { mutate: createEvent, isLoading } = useMutation({
    mutationFn: (newEvent) =>
      axiosInstance.post('/admin/events', newEvent).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']); // Invalidate the query to refetch event list
      navigate('/admin/events'); // Navigate back to event list after creation
    },
    onError: (error) => {
      console.error('Error creating event:', error.message);
      alert('Failed to create event');
    },
  });

  const handleCreateEvent = (eventData) => {
    setIsSubmitting(true);
    createEvent(eventData); // Pass the event data to the mutation function
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
      <EventForm
        initialValues={{ title: '', description: '', date: '', time: '', location: '' }}
        onSubmit={handleCreateEvent}
        isLoading={isLoading}
      />
      {isLoading && <p>Creating event...</p>}
    </div>
  );
};

export default EventCreate;
