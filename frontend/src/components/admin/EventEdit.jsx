// src/components/events/EventEdit.jsx (shared component)
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import EventForm from './EventForm';
import { Loader2, AlertCircle } from 'lucide-react';

const EventEdit = ({ isAdmin = false }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState(null);

  // Fetch event data
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data.event;
    },
  });

  // Update event mutation
  const { mutate: updateEvent, isLoading: isUpdating } = useMutation({
    mutationFn: async (eventData) => {
      const formData = new FormData();
      
      // Append all fields
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Special handling for arrays/objects
          if (key === 'speakers' || key === 'agenda') {
            formData.append(key, JSON.stringify(value));
          } 
          // Special handling for date
          else if (key === 'date') {
            formData.append(key, new Date(value).toISOString());
          }
          // Handle file uploads
          else if (value instanceof File) {
            if (value.size > 0) formData.append(key, value);
          }
          else {
            formData.append(key, value);
          }
        }
      });

      const response = await axiosInstance.put(`/events/${eventId}`, formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['event', eventId]);
      navigate(isAdmin ? '/admin/events' : '/my-events');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to update event');
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <button 
          onClick={() => navigate(isAdmin ? '/admin/events' : '/my-events')}
          className="text-gray-600 hover:text-gray-800"
        >
          Back to Events
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-100 text-red-600 p-3 rounded-lg mb-4">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <EventForm
        initialValues={{
          title: event.title,
          description: event.description,
          detailedDescription: event.detailedDescription || '',
          date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
          time: event.time,
          endTime: event.endTime,
          locationType: event.locationType,
          onlineLink: event.onlineLink || '',
          physicalLocation: event.physicalLocation || '',
          category: event.category,
          speakers: event.speakers || [],
          agenda: event.agenda || [],
          bannerImg: event.bannerImg || null,
          status: event.status,
        }}
        onSubmit={updateEvent}
        isLoading={isUpdating}
        isAdmin={isAdmin} // Pass whether user is admin
      />
    </div>
  );
};

export default EventEdit;