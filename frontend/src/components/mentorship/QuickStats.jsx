import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { axiosInstance } from "../../lib/axios";
import { Users, Bell } from "lucide-react"; // Import icons for mentees and requests

const QuickStats = () => {
  const navigate = useNavigate(); // Initialize navigate

  // Fetch mentee count
  const {
    data: menteeCountData,
    isLoading: menteeCountLoading,
    error: menteeCountError,
  } = useQuery({
    queryKey: ["menteeCount"],
    queryFn: async () => {
      const response = await axiosInstance.get("/mentorships/mentee-count");
      return response.data;
    },
  });

  // Fetch request count
  const {
    data: requestCountData,
    isLoading: requestCountLoading,
    error: requestCountError,
  } = useQuery({
    queryKey: ["requestCount"],
    queryFn: async () => {
      const response = await axiosInstance.get("/mentorships/request-count");
      return response.data;
    },
  });

  // Handle loading and errors
  if (menteeCountLoading || requestCountLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (menteeCountError || requestCountError) {
    return <div className="text-center py-4 text-red-500">Error fetching data</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-[#0d131c] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6 text-center">
        Quick Stats for Mentors
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mentees Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-center items-center mb-4">
            <Users className="text-blue-600" size={32} /> {/* Icon for mentees */}
          </div>
          <p className="text-gray-600 text-sm font-medium mb-2">Total Mentees</p>
          <p className="text-3xl font-bold text-[#0d131c]">
            {menteeCountData?.menteeCount || 0}
          </p>
        </div>

        {/* Requests Card (Clickable) */}
        <div
          onClick={() => navigate("/mentorship-requests")} // Navigate on click
          className="cursor-pointer bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300 active:scale-95"
        >
          <div className="flex justify-center items-center mb-4">
            <Bell className="text-purple-600" size={32} /> {/* Icon for requests */}
          </div>
          <p className="text-gray-600 text-sm font-medium mb-2">Pending Requests</p>
          <p className="text-3xl font-bold text-[#0d131c]">
            {requestCountData?.requestCount || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;