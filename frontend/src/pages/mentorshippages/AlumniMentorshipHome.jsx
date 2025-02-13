import React, { useEffect, useState } from "react";
import MentorshipCard from "../../components/mentorship/MentorshipCard";
import QuickStats from "../../components/mentorship/QuickStats";
import { axiosInstance } from '../../lib/axios'; 

const AlumniMentorshipHome = () => {
  const [isMentor, setIsMentor] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch mentor status when component mounts
  useEffect(() => {
    const fetchMentorStatus = async () => {
      try {
        const response = await axiosInstance.get("mentorships/mentor-status"); // Adjust API endpoint
        setIsMentor(response.data.isMentor); // Assuming API returns { isMentor: true/false }
      } catch (error) {
        console.error("Error fetching mentor status:", error);
      } finally {
        setLoading(false); // Set loading to false once API call completes
      }
    };

    fetchMentorStatus();
  }, []);

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#f8f9fc] group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Content */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h1 className="text-[#0d131c] tracking-light text-[32px] font-bold leading-tight px-4 text-left pb-3 pt-6">
              Welcome
            </h1>

            {/* Mentor Registration */}
            <h2 className="text-[#0d131c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Join the Almanet mentorship program
            </h2>

            {/* Mentor Registration Card */}
            <MentorshipCard
              title="Become a Mentor"
              description="Help others to grow and develop in their careers"
              buttonText="Register as Mentor"
              imageUrl="https://cdn.usegalileo.ai/sdxl10/f0e8d4ab-74c6-4784-9573-79c5cda9701b.png"
              link="/mentor/register"
              disabled={isMentor}
            />

            {/* Quick Stats Section - Only show if user is a mentor */}
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              isMentor && <QuickStats />
            )}

            {/* Manage Mentorship Card */}
            <MentorshipCard
              title="Manage My Mentorships"
              description="View details and manage your active mentorships"
              buttonText="Go to Dashboard"
              imageUrl="https://cdn.usegalileo.ai/sdxl10/5f178378-c86f-4dbc-8a1e-93022f42036a.png"
              link="/mentorship-dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniMentorshipHome;
