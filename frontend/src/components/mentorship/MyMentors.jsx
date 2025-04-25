import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Target, MessageCircle, Calendar, Loader2, UserX } from "lucide-react";
import ChatBox from "../ChatBox";
import MentorCard from './MentorCard';

const fetchAcceptedMentors = async () => {
  const { data } = await axiosInstance.get("/mentorships/my-mentors");
  return data;
};

const getRecommendedMentors = async (userId) => {
  try {
    const response = await axiosInstance.get(`/recommendations/${userId}/recommended-mentors`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended mentors:", error.response?.data || error.message);
    throw new Error("Failed to fetch recommended mentors");
  }
};

const MyMentorsPage = () => {
  const navigate = useNavigate();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [mentorshipId, setMentorshipId] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const { 
    data: mentors = [], 
    isLoading: mentorsLoading, 
    isError: mentorsError 
  } = useQuery({
    queryKey: ["acceptedMentors"],
    queryFn: fetchAcceptedMentors,
  });

  const { 
    data: recommendedMentors = [], 
    isLoading: recommendedLoading, 
    error: recommendedError 
  } = useQuery({
    queryKey: ['recommendedMentors'],
    queryFn: async () => {
      const userId = authUser?._id;
      if (!userId) return [];
      return await getRecommendedMentors(userId);
    },
    enabled: !!authUser?._id,
  });

  const handleMessageClick = (mentor) => {
    setSelectedMentor(mentor);
  };

  const handleViewGoals = async (mentorId) => {
    if (!authUser?._id) return;

    try {
      const { data } = await axiosInstance.get(
        `/mentorships/find?mentor=${mentorId}&mentee=${authUser._id}`
      );
      if (data?.mentorshipId) {
        navigate(`/mentorships/${data.mentorshipId}/goals`);
      }
    } catch (error) {
      console.error("Error fetching mentorship ID:", error);
    }
  };

  if (mentorsLoading || recommendedLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-primary dark:text-primary-dark" size={32} />
      </div>
    );
  }

  if (mentorsError || recommendedError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <UserX className="text-error dark:text-error-dark mb-4" size={40} />
        <h3 className="text-xl font-semibold mb-2 text-text dark:text-text-dark">Error Loading Mentors</h3>
        <p className="text-text-muted dark:text-text-dark-muted mb-4 max-w-md">
          We couldn't load your mentors. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-2">My Mentors</h1>
        <p className="text-text-muted dark:text-text-dark-muted">
          Connect with your mentors and track your progress
        </p>
      </div>

      {/* Current Mentors */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text dark:text-text-dark">Current Mentors</h2>
          <Link
            to="/find-mentor"
            className="flex items-center gap-2 text-primary dark:text-primary-dark hover:text-primary/80 dark:hover:text-primary-dark/80 transition"
          >
            <span>Find New Mentor</span>
          </Link>
        </div>

        {mentors.length === 0 ? (
          <div className="bg-card dark:bg-card-dark rounded-xl p-8 text-center border border-border dark:border-border-dark shadow-sm">
            <UserX className="mx-auto text-text-muted dark:text-text-dark-muted mb-4" size={48} />
            <h3 className="text-lg font-medium text-text dark:text-text-dark mb-2">No Mentors Found</h3>
            <p className="text-text-muted dark:text-text-dark-muted mb-6">
              You haven't connected with any mentors yet.
            </p>
            <Link
              to="/find-mentor"
              className="inline-flex items-center px-6 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition"
            >
              Browse Mentors
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.mentorId} className="bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-secondary dark:bg-secondary-dark overflow-hidden">
                      <img 
                        src={mentor.profilePicture || "https://cdn.usegalileo.ai/sdxl10/3bcb4a13-a797-4480-b43d-dfe101c8ef09.png"} 
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text dark:text-text-dark">{mentor.name}</h3>
                      <p className="text-sm text-primary dark:text-primary-dark">{mentor.industry || "No Industry"}</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-muted dark:text-text-dark-muted mb-4">
                    {mentor.expertise?.slice(0, 3).join(", ") || "No expertise listed"}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/messages`}
                      className="flex-1 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg text-sm font-medium hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Message
                    </Link>
                    <button
                      onClick={() => handleViewGoals(mentor.mentorId)}
                      className="flex-1 py-2 bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark rounded-lg text-sm font-medium hover:bg-secondary/80 dark:hover:bg-secondary-dark/80 transition flex items-center justify-center gap-2"
                    >
                      <Target size={16} />
                      Goals
                    </button>
                    <Link
                      to={`/schedule/${mentor.mentorId}`}
                      className="flex-1 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg text-sm font-medium hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition flex items-center justify-center gap-2"
                    >
                      <Calendar size={16} />
                      Schedule
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Mentors */}
      {recommendedMentors.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-6">Recommended For You</h2>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6">
              {recommendedMentors.map((mentor) => (
                <MentorCard 
                  key={mentor._id} 
                  mentor={mentor} 
                  className="min-w-[280px]"
                  isRecommended={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chat Modal */}
      {selectedMentor && (
        <ChatBox
          initialUserId={selectedMentor.mentorId}
          initialUserName={selectedMentor.name}
          initialUserAvatar={selectedMentor.profilePicture}
          onClose={() => setSelectedMentor(null)}
        />
      )}
    </div>
  );
};

export default MyMentorsPage;