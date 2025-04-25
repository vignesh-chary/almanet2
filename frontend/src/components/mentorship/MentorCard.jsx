import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCheck, ArrowRight, Star, Clock, MessageCircle, Calendar, ChevronRight, Loader2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import MentorshipRequestForm from "./MentorshipRequestForm";

const MentorCard = ({ mentor, className = "", isRecommended = false }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const queryClient = useQueryClient();

  // Fetch request status
  const { data: requestStatus = {}, isLoading: statusLoading } = useQuery({
    queryKey: ["mentorshipStatus", [mentor._id]],
    queryFn: () => axiosInstance.post("/mentorships/request-status/", { mentorIds: [mentor._id] }).then(res => res.data),
    enabled: !!mentor._id,
  });

  // Mutation for mentorship request
  const { mutate: requestMentorship, isLoading: isRequesting } = useMutation({
    mutationFn: async (requestData) => {
      console.log("Sending mentorship request:", requestData);
      const response = await axiosInstance.post("/mentorships/request", requestData);
      console.log("Mentorship request response:", response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Request successful, updating status");
      // Update the local status immediately
      queryClient.setQueryData(["mentorshipStatus", [mentor._id]], (oldData) => ({
        ...oldData,
        [mentor._id]: "pending"
      }));
      // Invalidate and refetch the status
      queryClient.invalidateQueries(["mentorshipStatus", [mentor._id]]);
      setSelectedMentor(null);
      window.location.reload();
    },
    onError: (error) => {
      console.error("Request error:", error);
      // Update the local status immediately
      queryClient.setQueryData(["mentorshipStatus", [mentor._id]], (oldData) => ({
        ...oldData,
        [mentor._id]: "pending"
      }));
      // Invalidate and refetch the status
      queryClient.invalidateQueries(["mentorshipStatus", [mentor._id]]);
      setSelectedMentor(null);
      window.location.reload();
    }
  });

  const currentStatus = requestStatus[mentor._id];
  const expertiseList = mentor.expertise?.slice(0, 3).join(" • ") || "General mentorship";

  const handleRequestSubmit = (requestData) => {
    console.log("Handling request submit:", requestData);
    requestMentorship(requestData);
  };

  return (
    <div 
      className={`relative bg-card dark:bg-card-dark rounded-2xl overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-dark" />
      
      {/* Mentor content */}
      <div className="p-6">
        <div className="flex items-start gap-5 mb-5">
          {/* Profile image with subtle border gradient */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 ${isHovered ? 'scale-105' : 'scale-100'} transition-transform duration-300`} />
            <img 
              src={mentor.userId?.profilePicture || "https://cdn.usegalileo.ai/sdxl10/3bcb4a13-a797-4480-b43d-dfe101c8ef09.png"}
              alt={mentor.userId?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-card dark:border-card-dark relative"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-text dark:text-text-dark truncate">
              {mentor.userId?.name}
              <span className="ml-2 text-sm font-normal bg-secondary dark:bg-secondary-dark text-primary dark:text-primary-dark px-2 py-0.5 rounded-full">
                {mentor.industry || "Mentor"}
              </span>
            </h3>
            
            <div className="flex items-center mt-1 space-x-4">
              <div className="flex items-center text-accent dark:text-accent-dark">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="text-sm font-medium">{mentor.rating || "4.8"}</span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${mentor.available ? 'bg-success dark:bg-success-dark' : 'bg-accent dark:bg-accent-dark'}`} />
                <span className="text-sm text-text-muted dark:text-text-dark-muted">
                  {mentor.available ? "Available now" : "Limited availability"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expertise chips */}
        <div className="mb-5">
          <p className="text-sm text-text-muted dark:text-text-dark-muted mb-2">Specializes in:</p>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise?.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="text-xs font-medium px-3 py-1 bg-secondary dark:bg-secondary-dark text-primary dark:text-primary-dark rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col space-y-3">
          {!isRecommended && (
            <>
              <Link
                to={`/messages/${mentor._id}`}
                className="flex items-center justify-between px-4 py-2.5 bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 text-primary dark:text-primary-dark mr-3" />
                  <span className="font-medium">Send Message</span>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted dark:text-text-dark-muted" />
              </Link>
              
              <Link
                to={`/schedule/${mentor._id}`}
                className="flex items-center justify-between px-4 py-2.5 bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-primary dark:text-primary-dark mr-3" />
                  <span className="font-medium">Schedule Session</span>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted dark:text-text-dark-muted" />
              </Link>
            </>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              currentStatus ? navigate(`/profile/${mentor.userId?.username}`) : setSelectedMentor(mentor._id);
            }}
            className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
              currentStatus === 'accepted'
                ? 'bg-success/10 dark:bg-success-dark/10 text-success dark:text-success-dark'
                : currentStatus === 'pending'
                ? 'bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark'
                : 'bg-primary dark:bg-primary-dark text-white'
            }`}
            disabled={isRequesting}
          >
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 mr-3" />
              <span className="font-medium">
                {isRequesting ? 'Processing...' : 
                 currentStatus === 'accepted' ? 'Already Connected' :
                 currentStatus === 'pending' ? 'Request Pending' : 'Request Mentorship'}
              </span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mentorship Request Form */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-4 right-4 text-text-muted dark:text-text-dark-muted hover:text-text dark:hover:text-text-dark"
              disabled={isRequesting}
            >
              <X size={20} />
            </button>
            <MentorshipRequestForm
              mentorId={selectedMentor}
              mentorName={mentor.userId?.name}
              onClose={() => setSelectedMentor(null)}
              onSubmit={handleRequestSubmit}
              isLoading={isRequesting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorCard;