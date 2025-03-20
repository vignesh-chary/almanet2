import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { UserCheck, ArrowRight } from "lucide-react";
import MentorshipRequestForm from "./MentorshipRequestForm";

// Function to fetch mentorship request statuses
const fetchRequestStatuses = async (mentorIds) => {
    const response = await axiosInstance.post("/mentorships/request-status/", { mentorIds });
    return response.data; // Expected format: { mentorId1: "pending", mentorId2: "accepted", ... }
};

const MentorCard = ({ mentors = [] }) => {
    // console.log("mentor data", mentors); // Debugging: Log the mentors array
    const navigate = useNavigate();
    const [selectedMentor, setSelectedMentor] = useState(null);
    const queryClient = useQueryClient();

    // Fetch request statuses using React Query
    const { data: requestStatus = {}, isLoading, isError } = useQuery({
        queryKey: ["mentorshipStatus", mentors.map((m) => m._id)],
        queryFn: () => fetchRequestStatuses(mentors.map((m) => m._id)),
        enabled: mentors.length > 0, // Prevent fetching if no mentors
    });

    // Mutation to handle mentorship request submission
    const { mutate: requestMentorship } = useMutation({
        mutationFn: async ({ mentorId, message }) => {
            await axiosInstance.post("/mentorships/request", { mentorId, message });
        },
        onMutate: async ({ mentorId }) => {
            // Optimistic update: Set status to "pending" immediately
            await queryClient.cancelQueries(["mentorshipStatus", mentors.map((m) => m._id)]);
            const previousStatus = queryClient.getQueryData(["mentorshipStatus", mentors.map((m) => m._id)]);
            queryClient.setQueryData(["mentorshipStatus", mentors.map((m) => m._id)], (old) => ({
                ...old,
                [mentorId]: "pending",
            }));
            return { previousStatus };
        },
        onError: (err, variables, context) => {
            // Revert to previous status on error
            queryClient.setQueryData(["mentorshipStatus", mentors.map((m) => m._id)], context.previousStatus);
        },
        onSettled: () => {
            // Refetch statuses to ensure data is up-to-date
            queryClient.invalidateQueries(["mentorshipStatus", mentors.map((m) => m._id)]);
        },
    });

    const handleRequestMentorship = (mentorId) => {
        setSelectedMentor(mentorId); // Open the mentorship request form
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            {isLoading && <p>Loading mentors...</p>}
            {isError && <p>Error fetching mentorship status.</p>}

            {mentors.map((mentor) => (
                <div
                    key={mentor._id}
                    className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
                    onClick={() => navigate(`/profile/${mentor.userId.username}`)}
                >
                    {/* Profile Image */}
                    <div className="flex justify-center">
                        <div
                            className="w-32 h-32 bg-cover bg-center rounded-full border-4 border-blue-100"
                            style={{
                                backgroundImage: `url(${mentor.userId.profilePicture})`,
                            }}
                        ></div>
                    </div>

                    {/* Mentor Info */}
                    <div className="text-center mt-4">
                        <p className="text-xl font-bold text-gray-900">{mentor.userId.name}</p>
                        <p className="text-gray-600 text-md mt-1">
                            <span className="font-semibold">Expertise:</span>{" "}
                            {mentor.expertise?.join(", ") || "Not specified"}
                        </p>
                        <p className="text-gray-500 text-md">
                            <span className="font-semibold">Industry:</span> {mentor.industry || "Not specified"}
                        </p>

                        {/* Request Button */}
                        <div className="mt-4">
                            {requestStatus[mentor._id] ? (
                                <button
                                    className={`px-4 py-2 text-sm rounded-lg ${
                                        requestStatus[mentor._id] === "pending"
                                            ? "bg-yellow-500 text-white"
                                            : requestStatus[mentor._id] === "accepted"
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                    }`}
                                    disabled
                                >
                                    {requestStatus[mentor._id]}
                                </button>
                            ) : (
                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRequestMentorship(mentor._id);
                                    }}
                                >
                                    <UserCheck size={16} /> Request
                                </button>
                            )}
                        </div>

                        {/* View Profile Button */}
                        <button
                            className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${mentor.userId.username}`);
                            }}
                        >
                            <span>View Profile</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            ))}

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

export default MentorCard;