import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import MentorCard from '../../components/mentorship/MentorCard.jsx';
import SearchBar from '../../components/mentorship/SearchBar.jsx';
import ExpertiseFilter from '../../components/mentorship/filters/ExpertiseFilter.jsx';
import IndustryFilter from '../../components/mentorship/filters/IndustryFilter.jsx';
import AvailabilityFilter from '../../components/mentorship/filters/AvailabilityFilter.jsx';

const FindMentor = () => {
  const [filters, setFilters] = useState({
    expertise: "",
    industry: "",
    availability: "",
    searchQuery: "",
  });

  const { data: mentors, isLoading, error } = useQuery({
    queryKey: ["mentors", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const { data } = await axiosInstance.get(`mentorships/mentors?${params}`);
      return data;
    },
  });

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-[#0e141b]">Find a Mentor</h1>

      {/* Search Bar */}
      <SearchBar filters={filters} setFilters={setFilters} />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <ExpertiseFilter filters={filters} setFilters={setFilters} />
        <IndustryFilter filters={filters} setFilters={setFilters} />
        <AvailabilityFilter filters={filters} setFilters={setFilters} />
      </div>

      {/* Mentor Cards */}
      {isLoading && <p className="text-center text-gray-600">Loading mentors...</p>}
      {error && <p className="text-center text-red-500">Error loading mentors.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors?.map((mentor) => (
          <MentorCard key={mentor._id} mentor={mentor} />
        ))}
      </div>
    </div>
  );
};

export default FindMentor;
