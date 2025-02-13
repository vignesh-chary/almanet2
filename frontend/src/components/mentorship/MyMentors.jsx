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

  if (isLoading) return <p>Loading mentors...</p>;
  if (isError) return <p>Error fetching mentors.</p>;

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
    <div className="relative flex min-h-screen flex-col bg-slate-50 overflow-x-hidden font-manrope">
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-3">
          <h2 className="text-[#0e141b] text-lg font-bold">My Mentors</h2>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <p className="text-[#0e141b] text-[32px] font-bold mb-6">Your Mentors</p>

            {mentors?.map((mentor, index) => (
              <div key={mentor.mentorId || `mentor-${index}`} className="flex items-stretch justify-between gap-4 rounded-xl mb-6">
                <div className="flex flex-[2_2_0px] flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#4e7397] text-sm">{mentor.industry || "No Industry"}</p>
                    <p className="text-[#0e141b] text-base font-bold">{mentor.name}</p>
                    <p className="text-[#4e7397] text-sm">Expertise: {mentor.expertise?.join(", ") || "Not specified"}</p>
                  </div>

                  {/* View Goals Button */}
                  <button onClick={() => handleViewGoals(mentor.mentorId)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md">
                    <Target size={18} />
                    <span>View Goals</span>
                  </button>
                </div>

                {/* Mentor Image */}
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{
                    backgroundImage: `url(${mentor.profilePicture || "https://cdn.usegalileo.ai/sdxl10/3bcb4a13-a797-4480-b43d-dfe101c8ef09.png"})`,
                  }}
                ></div>
              </div>
            ))}

            <div className="flex justify-end gap-3 px-4 py-3">
              <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md">
                <MessageCircle size={16} />
                <span>Message</span>
              </button>

              <Link to="/schedule" className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md">
                <Calendar size={16} />
                <span>Schedule</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyMentorsPage;
