import { useNavigate } from "react-router-dom"; // Add this import
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios.js';
import { useState } from "react";
import MentorCard from '../../components/mentorship/MentorCard.jsx';
import SectionHeader from '../../components/mentorship/SectionHeader.jsx';
import ActionCard from '../../components/mentorship/ActionCard.jsx';
import SearchBar from '../../components/mentorship/SearchBar.jsx';

function StudentMentorshipHome() {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const navigate = useNavigate(); // Use the useNavigate hook
  const [searchQuery, setSearchQuery] = useState("");

  // Function to fetch recommended mentors
  const getRecommendedMentors = async (userId) => {
    try {
      const response = await axiosInstance.get(`/recommendations/${userId}/recommended-mentors`);
      return response.data;
    } catch (error) {
      console.error("Error fetching recommended mentors:", error.response?.data || error.message);
      throw new Error("Failed to fetch recommended mentors");
    }
  };

  // Fetch recommended mentors using React Query
  const { data: recommendedMentors = [], isLoading, error } = useQuery({
    queryKey: ['recommendedMentors'],
    queryFn: async () => {
      const userId = authUser._id; // Replace with actual user ID
      return await getRecommendedMentors(userId);
    },
  });

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/find-mentor?query=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/find-mentor");
    }
  };

  if (isLoading) return <p>Loading mentors...</p>;
  if (error) return <p>Error loading mentors</p>;

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white overflow-x-hidden" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Welcome Banner Section */}
        <div className="@container">
          <div className="p-4">
            <div className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 pb-10" 
              style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/58c0efd4-72df-4c9c-b35a-3d7c53e9af6c.png")' }}
            >
              <div className="flex flex-col gap-2 text-left">
                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                  Welcome to Mentor.me
                </h1>
                <h2 className="text-white text-sm font-normal">
                  Get guidance from industry experts and build your skills. It's free for students.
                </h2>
              </div>

              {/* Search Bar */}
              <SearchBar 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Recommended Mentors Section */}
            {recommendedMentors.length > 0 && (
              <>
                <SectionHeader text="Recommended mentors" />
                <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex items-stretch p-4 gap-8">
                    <MentorCard mentors={recommendedMentors} />
                  </div>
                </div>
              </>
            )}

            {/* Find a Mentor Section */}
            <SectionHeader text="Find a mentor" />
            <ActionCard
              src="https://cdn.usegalileo.ai/sdxl10/1471010a-f9de-4331-9627-fa62bbeba02f.png"
              mainText="Find a mentor"
              subText="Browse profiles and connect with mentors"
              buttonText="Browse"
              onClick={() => navigate("/find-mentor")}
            />

            {/* My Mentors Section */}
            <SectionHeader text="My mentors" />
            <ActionCard
              src="https://cdn.usegalileo.ai/sdxl10/c189ee71-4e93-4db1-90e7-0bde8985e3a6.png"
              mainText="My mentors"
              subText="View mentors you've connected with"
              buttonText="View all"
              onClick={() => navigate("/my-mentors")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentMentorshipHome;