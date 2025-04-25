import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import EventForm from "./EventForm";
import { AlertCircle, Loader2 } from "lucide-react";

const EventCreate = () => {
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: createEvent, isLoading } = useMutation({
    mutationFn: async (eventData) => {
      try {
        // Reset progress and error states
        setError(null);
        setUploadProgress("Preparing files...");
        
        // Create FormData object
        const formData = new FormData();
        
        // Add basic text fields
        Object.entries(eventData).forEach(([key, value]) => {
          // Skip file fields and complex objects that need special handling
          if (key !== 'bannerImg' && 
              key !== 'speakers' && 
              key !== 'agenda' && 
              value !== null && 
              value !== undefined) {
            formData.append(key, value);
          }
        });

        // Format date properly if it exists
        if (eventData.date) {
          const dateObj = new Date(eventData.date);
          formData.set('date', dateObj.toISOString());
        }

        // Handle banner image
        if (eventData.bannerImg instanceof File) {
          setUploadProgress("Processing banner image...");
          formData.append('bannerImg', eventData.bannerImg);
        }

        // Add speaker data
        if (eventData.speakers && Array.isArray(eventData.speakers)) {
          setUploadProgress("Processing speaker information...");
          // Add speaker data as JSON string
          formData.append('speakers', JSON.stringify(
            eventData.speakers.map(speaker => ({
              name: speaker.name || '',
              role: speaker.role || '',
              bio: speaker.bio || ''
            }))
          ));
          
          // Add speaker images
          if (eventData.speakers.some(s => s.image instanceof File)) {
            setUploadProgress("Processing speaker images...");
          }
          
          eventData.speakers.forEach((speaker, index) => {
            if (speaker.image instanceof File) {
              formData.append(`speakerImage_${index}`, speaker.image);
            }
          });
        }

        // Add agenda as JSON string
        if (eventData.agenda && Array.isArray(eventData.agenda)) {
          setUploadProgress("Processing agenda information...");
          formData.append('agenda', JSON.stringify(eventData.agenda));
        }

        // Log form data entries for debugging
        console.log("FormData entries:", 
          Array.from(formData.entries())
            .map(([key, value]) => {
              if (value instanceof File) {
                return [key, `File: ${value.name} (${value.size} bytes)`];
              }
              return [key, value];
            })
        );

        setUploadProgress("Uploading to server...");
        
        // Send the request with extended timeout and proper multipart configuration
        const response = await axiosInstance.post("/events", formData, {
          timeout: 120000, // 2 minutes
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          headers: {
            // Important: Don't set Content-Type manually - axios will set it with proper boundary
            // Remove any Content-Type header from defaults
            'Content-Type': undefined
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(`Uploading: ${percentCompleted}%`);
          }
        });
        
        setUploadProgress("Upload complete! Redirecting...");
        return response.data;
      } catch (error) {
        console.error("Error details:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["events"]);
      navigate(`/my-events/${data.event._id}`);
    },
    onError: (error) => {
      // Extract meaningful error message
      let errorMessage = "Failed to create event";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setUploadProgress(null);
      console.error("Error creating event:", error);
      
      // Log detailed error information
      if (error.response) {
        console.error("Error response:", error.response);
        console.error("Error data:", error.response.data);
      }
    },
  });

  return (
    <div className="relative flex min-h-screen flex-col bg-background dark:bg-background-dark">
      <div className="container mx-auto flex flex-1 flex-col px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text dark:text-text-dark">Create New Event</h2>
            <button
              onClick={() => navigate("/admin/events")}
              className="px-4 py-2 text-sm text-text dark:text-text-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
            >
              Back to Events
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-error/10 dark:bg-error-dark/10 text-error dark:text-error-dark p-3 rounded-lg mb-4">
              <AlertCircle size={20} />
              <p className="whitespace-pre-line">{error}</p>
            </div>
          )}
          
          {isLoading && uploadProgress && (
            <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark p-3 rounded-lg mb-4">
              <Loader2 size={20} className="animate-spin" />
              <p>{uploadProgress}</p>
            </div>
          )}

          <div className="bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark p-6">
            <EventForm
              initialValues={{
                title: "",
                description: "",
                detailedDescription: "",
                date: "",
                time: "",
                endTime: "",
                locationType: "offline",
                onlineLink: "",
                physicalLocation: "",
                category: "",
                eventType: "",
                speakers: [],
                agenda: [],
                bannerImg: null,
                status: "draft",
              }}
              onSubmit={createEvent}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreate;