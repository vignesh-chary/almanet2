import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { UserCheck, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import MentorshipRequestForm from "./MentorshipRequestForm";

// Function to fetch mentorship request statuses
const fetchRequestStatuses = async (mentorIds) => {
  const response = await axiosInstance.post("/mentorships/request-status/", { mentorIds });
  return response.data;
};

const MentorProfileCard = ({ mentor }) => {
  const navigate = useNavigate();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: requestStatus = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mentorshipStatus", mentor._id],
    queryFn: () => fetchRequestStatuses([mentor._id]),
    enabled: !!mentor._id,
  });

  const { mutate: requestMentorship, isLoading: isRequesting } = useMutation({
    mutationFn: async ({ mentorId, message, mentorshipType, goals }) => {
      await axiosInstance.post("/mentorships/request", { mentorId, message, mentorshipType, goals });
    },
    onMutate: async ({ mentorId }) => {
      await queryClient.cancelQueries(["mentorshipStatus", mentor._id]);
      const previousStatus = queryClient.getQueryData(["mentorshipStatus", mentor._id]);
      queryClient.setQueryData(["mentorshipStatus", mentor._id], (old) => ({
        ...old,
        [mentorId]: "pending",
      }));
      return { previousStatus };
    },
    onSuccess: () => {
      toast.success("Mentorship request sent successfully!");
      queryClient.invalidateQueries(["mentorshipStatus"]);
      queryClient.invalidateQueries(["acceptedMentors"]);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || "Failed to send mentorship request");
      queryClient.setQueryData(["mentorshipStatus", mentor._id], context.previousStatus);
    }
  });

  const handleRequestMentorship = (mentorId) => {
    setSelectedMentor(mentorId);
  };

  return (
    <div
      className="bg-card dark:bg-card-dark p-4 rounded-xl border border-border dark:border-border-dark"
      onClick={() => navigate(`/profile/${mentor.userId.username}`)}
    >
      {/* Profile Image */}
      <div className="flex justify-center">
        <div
          className="w-24 h-24 bg-cover bg-center rounded-full border-4 border-secondary dark:border-secondary-dark"
          style={{
            backgroundImage: `url(${
              mentor.userId.profilePicture ||
              "https://cdn.usegalileo.ai/sdxl10/8a74a946-09bb-4f09-8a4c-23e4686e5d68.png"
            })`,
          }}
        ></div>
      </div>

      {/* Mentor Info */}
      <div className="text-center mt-3">
        <p className="text-lg font-bold text-text dark:text-text-dark truncate">{mentor.userId.name || "No Name"}</p>
        <p className="text-text-muted dark:text-text-dark-muted text-sm mt-1 truncate">
          <span className="font-semibold">Expertise:</span>{" "}
          {mentor.expertise?.slice(0, 2).join(", ") || "Not specified"}
        </p>
        <p className="text-text-muted dark:text-text-dark-muted text-sm truncate">
          <span className="font-semibold">Industry:</span> {mentor.industry || "Not specified"}
        </p>

        {/* Request Button */}
        <div className="mt-3">
          {isLoading ? (
            <button className="px-3 py-1.5 text-sm rounded-lg bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark" disabled>
              <Loader2 className="animate-spin" size={14} />
            </button>
          ) : requestStatus[mentor._id] ? (
            <button
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 justify-center ${
                requestStatus[mentor._id] === "pending"
                  ? "bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark"
                  : requestStatus[mentor._id] === "accepted"
                  ? "bg-success/10 dark:bg-success-dark/10 text-success dark:text-success-dark"
                  : "bg-error/10 dark:bg-error-dark/10 text-error dark:text-error-dark"
              }`}
              disabled
            >
              {requestStatus[mentor._id] === "pending" && <Loader2 className="animate-spin" size={14} />}
              {requestStatus[mentor._id]}
            </button>
          ) : (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary dark:bg-primary-dark text-white rounded-lg disabled:bg-secondary dark:disabled:bg-secondary-dark disabled:text-text-muted dark:disabled:text-text-dark-muted text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRequestMentorship(mentor._id);
              }}
              disabled={isRequesting}
            >
              {isRequesting ? <Loader2 className="animate-spin" size={14} /> : <UserCheck size={14} />}
              {isRequesting ? "Sending..." : "Request"}
            </button>
          )}
        </div>

        {/* View Profile Button */}
        <button
          className="flex items-center gap-1.5 mt-2 text-primary dark:text-primary-dark text-sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${mentor.userId.username}`);
          }}
        >
          <span>View Profile</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Mentorship Request Form */}
      {selectedMentor && (
        <MentorshipRequestForm
          mentorId={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onSubmit={(message) => {
            requestMentorship({ mentorId: selectedMentor, message });
            setSelectedMentor(null);
          }}
        />
      )}
    </div>
  );
};

export default MentorProfileCard;