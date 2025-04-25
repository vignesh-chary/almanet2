import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import MentorProfileCard from "../../components/mentorship/MentorProfileCard.jsx";
import { motion } from "framer-motion";
import { Search, Users, BookOpen, Briefcase } from "lucide-react";
import axios from "axios";

const FindMentor = () => {
  const [filters, setFilters] = useState({
    searchQuery: "",
    expertise: "",
    industry: "",
  });

  const [stats, setStats] = useState({
    totalMentors: 0,
    activeEngagements: 0,
    successfulMentorships: 0,
  });

  // Fetch mentors based on search query and filters
  const {
    data: mentors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["mentors", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        searchQuery: filters.searchQuery,
        expertise: filters.expertise,
        industry: filters.industry,
      }).toString();
      const { data } = await axiosInstance.get(`/mentorships/mentors?${params}`);
      return data;
    },
    enabled: true,
  });

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/mentorships/stats`);
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="container mx-auto px-4 py-5">
        <div className="max-w-[960px] mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] min-w-72 text-text dark:text-text-dark">
              Find a Mentor
            </h1>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="px-4 py-3">
            <label className="flex flex-col min-w-40 h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                <div className="text-accent dark:text-accent-dark flex border-none bg-secondary dark:bg-secondary-dark items-center justify-center pl-4 rounded-l-xl border-r-0">
                  <Search className="w-6 h-6" />
                </div>
                <input
                  placeholder="Search by skills or interests"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text dark:text-text-dark focus:outline-0 focus:ring-0 border-none bg-secondary dark:bg-secondary-dark focus:border-none h-full placeholder:text-accent dark:placeholder:text-accent-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                />
              </div>
            </label>
          </form>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-4 p-4">
            <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-border dark:border-border-dark">
              <p className="text-text dark:text-text-dark text-base font-medium leading-normal">Total Mentors</p>
              <p className="text-text dark:text-text-dark tracking-light text-2xl font-bold leading-tight">
                {stats.totalMentors}+
              </p>
              <p className="text-primary dark:text-primary-dark text-base font-medium leading-normal">
                +15% since last quarter
              </p>
            </div>
            <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-border dark:border-border-dark">
              <p className="text-text dark:text-text-dark text-base font-medium leading-normal">Active Engagements</p>
              <p className="text-text dark:text-text-dark tracking-light text-2xl font-bold leading-tight">
                {stats.activeEngagements}+
              </p>
              <p className="text-primary dark:text-primary-dark text-base font-medium leading-normal">
                +10% since last quarter
              </p>
            </div>
            <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-border dark:border-border-dark">
              <p className="text-text dark:text-text-dark text-base font-medium leading-normal">Successful Mentorships</p>
              <p className="text-text dark:text-text-dark tracking-light text-2xl font-bold leading-tight">
                {stats.successfulMentorships}+
              </p>
              <p className="text-primary dark:text-primary-dark text-base font-medium leading-normal">
                +20% since last quarter
              </p>
            </div>
          </div>

          {/* Featured Mentors Section */}
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 text-text dark:text-text-dark">
            Featured Mentors
          </h2>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary-dark"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/10 dark:bg-error-dark/10 mb-4">
                <svg className="w-8 h-8 text-error dark:text-error-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-xl text-text dark:text-text-dark font-semibold mb-2">Oops! Something went wrong</p>
              <p className="text-text-muted dark:text-text-dark-muted mb-6">We couldn't load the mentors. Please try again.</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-primary dark:bg-primary-dark"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {mentors.map((mentor, index) => (
                <motion.div
                  key={mentor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full max-w-[240px] mx-auto"
                >
                  <MentorProfileCard mentor={mentor} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindMentor;