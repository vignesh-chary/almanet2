import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import MentorProfileCard from "../../components/mentorship/MentorProfileCard.jsx";
import SearchBar from "../../components/mentorship/SearchBar.jsx";

const FindMentor = () => {
  const [filters, setFilters] = useState({
    searchQuery: "", // Only searchQuery is needed
  });

  // Fetch mentors based on search query
  const {
    data: mentors = [],
    isLoading,
    error,
    refetch, // Add refetch function from useQuery
  } = useQuery({
    queryKey: ["mentors", filters.searchQuery], // Use searchQuery as the query key
    queryFn: async () => {
      const params = new URLSearchParams({ searchQuery: filters.searchQuery }).toString();
      const { data } = await axiosInstance.get(`/mentorships/mentors?${params}`);
      return data;
    },
    enabled: false, // Disable automatic fetching on component mount
  });

  // Handle search
  const handleSearch = () => {
    refetch(); // Manually trigger data fetching
  };

  // Debugging: Log mentors data
  console.log("Mentors Data:", mentors);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gray-900 py-20">
        <div className="absolute inset-0 bg-[url('/images/mentorship-banner.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect Mentor
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Connect with experienced mentors to guide you in your career journey.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Mentor Cards Section */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500">Error loading mentors. Please try again.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mentors.map((mentor) => (
              <MentorProfileCard key={mentor._id} mentor={mentor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindMentor;