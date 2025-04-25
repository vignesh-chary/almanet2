import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { Calendar, Clock, MapPin, User, Users, ArrowLeft, Share2, Loader2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  // Get the logged-in user's ID
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const userId = authUser?._id;

  // Check if we're trying to access the create page
  useEffect(() => {
    if (eventId === 'create') {
      // Redirect to the correct create event route
      navigate('/events/create');
    }
  }, [eventId, navigate]);

  // If the eventId is 'create', don't make any API calls
  const isCreateRoute = eventId === 'create';

  // Fetch event details
  const { data: event, isLoading, error } = useQuery({
    queryKey: ["eventDetails", eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`events/${eventId}`);
      return response.data.event;
    },
    enabled: !isCreateRoute && !!eventId && eventId !== 'create',
  });

  // Mutation for registering to the event
  const { mutate: registerMutation, isLoading: isRegistering } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(`events/${eventId}/register`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["eventDetails", eventId]);
    },
  });

  // Mutation for adding a comment
  const { mutate: commentMutation } = useMutation({
    mutationFn: async (commentText) => {
      const response = await axiosInstance.post(`/events/${eventId}/comments`, {
        text: commentText
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["eventDetails", eventId]);
      setComment("");
    },
  });

  // Handle case where eventId is missing
  if (!eventId) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-background dark:bg-background-dark group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center items-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-2">Invalid Event ID</h2>
              <p className="text-accent dark:text-accent-dark mb-4">The event you're looking for doesn't exist.</p>
              <Link to="/events" className="text-primary hover:underline">
                Browse All Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we're redirecting, show a loading indicator
  if (isCreateRoute) {
    return (
      <div className="flex justify-center items-center p-8 bg-background dark:bg-background-dark">
        <span className="text-text dark:text-text-dark">Redirecting to event creation page...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-background dark:bg-background-dark group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-col gap-6">
                <div className="w-full h-64 bg-secondary dark:bg-secondary-dark rounded-xl animate-pulse" />
                <div className="space-y-4">
                  <div className="w-3/4 h-8 bg-secondary dark:bg-secondary-dark rounded animate-pulse" />
                  <div className="w-1/2 h-6 bg-secondary dark:bg-secondary-dark rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-background dark:bg-background-dark group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="text-center py-8">
                <p className="text-error dark:text-error-dark mb-4">Error loading event details. Please try again.</p>
                <button
                  onClick={() => navigate('/events')}
                  className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark"
                >
                  Back to Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background dark:bg-background-dark group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Back button */}
            <div className="px-4 py-2">
              <Link
                to="/events"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowLeft size={18} />
                Back to Events
              </Link>
            </div>

            {/* Event header with banner */}
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-background dark:bg-background-dark @[480px]:rounded-xl min-h-[218px]"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url(${event.bannerImg || "/placeholder-event.jpg"})`,
                    backgroundColor: event.bannerImg ? 'transparent' : '#f3f4f6'
                  }}
                >
                  <div className="flex p-4">
                    <p className="text-white tracking-light text-[28px] font-bold leading-tight">{event.title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event details */}
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-accent dark:text-accent-dark" />
                <p className="text-accent dark:text-accent-dark">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={18} className="text-accent dark:text-accent-dark" />
                <p className="text-accent dark:text-accent-dark">
                  {formatTime(event.time)} {event.endTime && `- ${formatTime(event.endTime)}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-accent dark:text-accent-dark" />
                <p className="text-accent dark:text-accent-dark">
                  {event.locationType === 'online' ? (
                    <span>Online Event</span>
                  ) : event.locationType === 'hybrid' ? (
                    <span>Hybrid Event ({event.physicalLocation})</span>
                  ) : (
                    <span>{event.physicalLocation}</span>
                  )}
                  {event.onlineLink && event.locationType !== 'offline' && (
                    <a
                      href={event.onlineLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline"
                    >
                      (Join Link)
                    </a>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Users size={18} className="text-accent dark:text-accent-dark" />
                <p className="text-accent dark:text-accent-dark">
                  {event.participants?.length || 0} attendees
                </p>
              </div>
            </div>

            {/* About section */}
            <div className="px-4 py-3">
              <h2 className="text-text dark:text-text-dark text-xl font-bold mb-2">About the Event</h2>
              <p className="text-text dark:text-text-dark whitespace-pre-line">{event.description}</p>

              {event.detailedDescription && (
                <div className="mt-4">
                  <p className="text-text dark:text-text-dark whitespace-pre-line">{event.detailedDescription}</p>
                </div>
              )}
            </div>

            {/* Speakers section */}
            {event.speakers?.length > 0 && (
              <div className="px-4 py-3">
                <h2 className="text-text dark:text-text-dark text-xl font-bold mb-2">Speakers</h2>
                <div className="space-y-4">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14"
                        style={{
                          backgroundImage: `url(${speaker.image || '/placeholder-user.jpg'})`,
                          backgroundColor: speaker.image ? 'transparent' : '#f3f4f6'
                        }}
                      />
                      <div>
                        <p className="text-text dark:text-text-dark font-medium">{speaker.name}</p>
                        <p className="text-accent dark:text-accent-dark text-sm">{speaker.role || ''}</p>
                        {speaker.bio && (
                          <p className="text-accent dark:text-accent-dark text-sm mt-1">{speaker.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participants section */}
            {event.participants?.length > 0 && (
              <div className="px-4 py-3">
                <h2 className="text-text dark:text-text-dark text-xl font-bold mb-2">Participants ({event.participants.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.participants.map((participant, index) => {
                    // Skip if participant data is incomplete
                    if (!participant.user) return null;
                    
                    return (
                      <Link 
                        key={index} 
                        to={`/profile/${participant.user._id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary dark:hover:bg-secondary-dark transition-colors"
                      >
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12"
                          style={{
                            backgroundImage: `url(${participant.user.profilePicture || '/placeholder-user.jpg'})`,
                            backgroundColor: participant.user.profilePicture ? 'transparent' : '#f3f4f6'
                          }}
                        />
                        <div>
                          <p className="text-text dark:text-text-dark font-medium hover:text-primary">
                            {participant.user.name}
                          </p>
                          <p className="text-accent dark:text-accent-dark text-sm">
                            Registered on {new Date(participant.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Agenda section */}
            {event.agenda?.length > 0 && (
              <div className="px-4 py-3">
                <h2 className="text-text dark:text-text-dark text-xl font-bold mb-2">Agenda</h2>
                <div className="space-y-3">
                  {event.agenda.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="bg-secondary dark:bg-secondary-dark rounded-lg p-2 flex items-center justify-center w-12 h-12">
                        <Clock size={18} className="text-accent dark:text-accent-dark" />
                      </div>
                      <div>
                        <p className="text-text dark:text-text-dark font-medium">{item.time} - {item.title}</p>
                        {item.description && (
                          <p className="text-accent dark:text-accent-dark text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments section */}
            <div className="px-4 py-3">
              <h2 className="text-text dark:text-text-dark text-xl font-bold mb-2">Discussion</h2>

              {event.comments?.length > 0 ? (
                <div className="space-y-4">
                  {event.comments.map((comment, index) => (
                    <div key={index} className="flex gap-3">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10"
                        style={{
                          backgroundImage: `url(${comment.user?.profilePicture || '/placeholder-user.jpg'})`,
                          backgroundColor: comment.user?.profilePicture ? 'transparent' : '#f3f4f6'
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-text dark:text-text-dark font-medium">
                            {comment.user?.name || 'Anonymous'}
                          </p>
                          <p className="text-accent dark:text-accent-dark text-xs">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-text dark:text-text-dark mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-accent dark:text-accent-dark">No comments yet. Be the first to comment!</p>
              )}

              {/* Comment form */}
              {authUser && (
                <div className="mt-4 flex gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10"
                    style={{
                      backgroundImage: `url(${authUser.profilePicture || '/placeholder-user.jpg'})`,
                      backgroundColor: authUser.profilePicture ? 'transparent' : '#f3f4f6'
                    }}
                  />
                  <div className="flex-1">
                    <textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-primary"
                      rows={2}
                    />
                    <button
                      onClick={() => commentMutation(comment)}
                      disabled={!comment.trim()}
                      className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Registration button */}
            <div className="px-4 py-6 flex justify-center">
              {authUser ? (
                <button
                  onClick={() => registerMutation()}
                  disabled={isRegistering || event.participants?.some(participant => participant.user?._id === userId)}
                  className={`px-6 py-3 rounded-full font-medium ${
                    event.participants?.some(participant => participant.user?._id === userId)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-dark"
                  } transition-colors disabled:opacity-50`}
                >
                  {isRegistering ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : event.participants?.some(participant => participant.user?._id === userId) ? (
                    "Already Registered"
                  ) : (
                    "Register for Event"
                  )}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
                >
                  Login to Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;