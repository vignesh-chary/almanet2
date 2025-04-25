import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Calendar, Clock, MapPin, Users, Edit2, Trash2, ArrowLeft, Loader2, AlertTriangle, Check, X } from 'lucide-react';
import { format, isValid } from 'date-fns';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch event details with participants
  const { isLoading, error, data: event } = useQuery({
    queryKey: ['adminEvent', eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data.event;
    },
    enabled: !!eventId && eventId !== 'create',
  });

  // Delete event mutation
  const { mutate: deleteEvent, isLoading: isDeleting } = useMutation({
    mutationFn: () => axiosInstance.delete(`/events/${eventId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminEvents']);
      navigate('/admin/events');
    },
  });

  // Update status mutation
  const { mutate: updateEventStatus, isLoading: isUpdatingStatus } = useMutation({
    mutationFn: (status) => axiosInstance.patch(`/events/${eventId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminEvent', eventId]);
    },
  });

  const safeFormat = (dateValue, formatString) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    return isValid(date) ? format(date, formatString) : 'Invalid date';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="mb-4 text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
          <Loader2 size={40} className="animate-spin text-primary relative" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-text-muted">
            <AlertTriangle size={40} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">Error Loading Event</h3>
          <p className="text-text-muted mb-4">{error.message}</p>
          {/* <button
            onClick={() => navigate('/admin/events')}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            Back to Events
          </button> */}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-text-muted">
            <AlertTriangle size={40} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">Event Not Found</h3>
          {/* <button
            onClick={() => navigate('/admin/events')}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            Back to Events
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background overflow-x-hidden">
      {confirmAction && (
        <ConfirmDialog 
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin/events')}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={18} />
            Back to Events
          </button>
          <div className="flex gap-3">
            {event?.status === 'cancelled' && (
              <button
                onClick={() => setConfirmAction({
                  title: "Republish Event",
                  message: "Are you sure you want to republish this event? It will be visible to all users again.",
                  onConfirm: () => updateEventStatus('published')
                })}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Check size={18} />
                )}
                Publish
              </button>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {event?.title}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event?.status === 'published' ? 'bg-green-100 text-green-800' :
              event?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {event?.status}
            </span>
          </div>

          {/* Banner Image */}
          {event.bannerImg && (
            <div className="mb-6">
              <img 
                src={event.bannerImg} 
                alt="Event banner" 
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-base text-gray-900">
                  {safeFormat(event?.date, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Time</h3>
                <p className="text-base text-gray-900">
                  {formatTime(event?.time)} {event?.endTime && `- ${formatTime(event.endTime)}`}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                <p className="text-base text-gray-900">
                  {event.createdBy?.name || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-base text-gray-900">
                  {event?.locationType === 'online' ? (
                    <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Online Event (Click to join)
                    </a>
                  ) : event?.locationType === 'hybrid' ? (
                    <>
                      <span>Hybrid: {event.physicalLocation}</span>
                      <br />
                      <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        (Online option available)
                      </a>
                    </>
                  ) : (
                    event?.physicalLocation
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="text-base text-gray-900 capitalize">
                  {event?.category}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
                <p className="text-base text-gray-900 capitalize">
                  {event?.eventType?.replace('-', ' ') || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-base text-gray-900 whitespace-pre-line">
              {event?.description}
            </p>
          </div>

          {event.detailedDescription && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Detailed Description</h3>
              <p className="text-base text-gray-900 whitespace-pre-line">
                {event.detailedDescription}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {/* Commented out unpublish button
            {event?.status === 'published' && (
              <button
                onClick={() => setConfirmAction({
                  title: "Unpublish Event",
                  message: "Are you sure you want to unpublish this event? It will no longer be visible to users.",
                  onConfirm: () => updateEventStatus('unpublished')
                })}
                disabled={isUpdatingStatus}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                {isUpdatingStatus ? <Loader2 className="animate-spin" /> : 'Unpublish'}
              </button>
            )}
            */}
            <button
              onClick={() => setConfirmAction({
                title: "Delete Event",
                message: "Are you sure you want to delete this event? This action cannot be undone.",
                onConfirm: () => deleteEvent()
              })}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : 'Delete Event'}
            </button>
            <Link
              to={`/admin/events/${eventId}/edit`}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
            >
              <Edit2 size={18} />
              Edit Event
            </Link>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Participants ({event?.participants?.length || 0})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : event?.participants?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No participants have registered for this event yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {event?.participants?.map((participant) => (
                    <tr key={participant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/admin/users/${participant.user?._id}`}
                          className="flex items-center"
                        >
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={participant.user?.profilePicture || '/placeholder-user.jpg'}
                              alt={participant.user?.name || "User"}
                            />
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/admin/users/${participant.user?._id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {participant.user?.name || "Unknown User"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a href={`mailto:${participant.user?.email}`} className="hover:text-blue-600">
                          {participant.user?.email || "No email available"}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(participant.registrationDate), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Speakers Section */}
        {event?.speakers?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Speakers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.speakers.map((speaker, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 h-16 w-16">
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={speaker.image || '/placeholder-speaker.jpg'}
                      alt={speaker.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{speaker.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{speaker.role}</p>
                    {speaker.bio && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{speaker.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agenda Section */}
        {event?.agenda?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Event Agenda</h2>
            <div className="space-y-4">
              {event.agenda.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 bg-blue-50 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{item.time} - {item.title}</h3>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;