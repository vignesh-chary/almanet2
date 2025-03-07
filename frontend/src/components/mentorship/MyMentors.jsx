import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Target, MessageCircle, Calendar } from "lucide-react";

const fetchAcceptedMentors = async () => {
  const { data } = await axiosInstance.get("/mentorships/my-mentors");
  return data;
};

const MyMentorsPage = () => {
  const navigate = useNavigate();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [mentorshipId, setMentorshipId] = useState(null);

  const { data: mentors, isLoading, isError } = useQuery({
    queryKey: ["acceptedMentors"],
    queryFn: fetchAcceptedMentors,
  });

  if (isLoading) return <p className="text-center mt-10">Loading mentors...</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Error fetching mentors.</p>;

  const handleViewGoals = async (mentorId) => {
    if (!authUser || !authUser._id) {
      console.error("User is not defined");
      return;
    }

    try {
      const { data } = await axiosInstance.get(
        `/mentorships/find?mentor=${mentorId}&mentee=${authUser._id}`
      );
      if (data?.mentorshipId) {
        setMentorshipId(data.mentorshipId);
        navigate(`/mentorships/${data.mentorshipId}/goals`);
      } else {
        console.error("Mentorship ID not found.");
      }
    } catch (error) {
      console.error("Error fetching mentorship ID:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 font-manrope">
      <div className="layout-container flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-300 px-6 py-4 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">My Mentors</h2>
        </header>

        {/* Content */}
        <div className="px-8 py-6 flex flex-col items-center">
          <div className="w-full max-w-3xl">
            <p className="text-2xl font-semibold text-gray-900 mb-6">Your Mentors</p>

            {mentors?.map((mentor, index) => (
              <div
                key={mentor.mentorId || `mentor-${index}`}
                className="flex flex-col md:flex-row items-center bg-white shadow-md rounded-lg overflow-hidden mb-6 p-4"
              >
                {/* Mentor Image */}
                <div
                  className="w-24 h-24 md:w-32 md:h-32 bg-cover bg-center rounded-full"
                  style={{
                    backgroundImage: `url(${mentor.profilePicture || "https://cdn.usegalileo.ai/sdxl10/3bcb4a13-a797-4480-b43d-dfe101c8ef09.png"})`,
                  }}
                ></div>

                {/* Mentor Details */}
                <div className="flex-1 ml-4 mt-3 md:mt-0">
                  <p className="text-sm text-gray-600">{mentor.industry || "No Industry"}</p>
                  <p className="text-lg font-bold text-gray-900">{mentor.name}</p>
                  <p className="text-sm text-gray-600">
                    Expertise: {mentor.expertise?.join(", ") || "Not specified"}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => handleViewGoals(mentor.mentorId)}
                      className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm shadow hover:bg-blue-600 transition"
                    >
                      <Target size={16} />
                      <span>View Goals</span>
                    </button>

                    <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm shadow hover:bg-gray-300 transition">
                      <MessageCircle size={16} />
                      <span>Message</span>
                    </button>

                    <Link
                      to={`/schedule/${mentor.mentorId}`}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm shadow hover:bg-gray-300 transition"
                    >
                      <Calendar size={16} />
                      <span>Schedule</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyMentorsPage;
