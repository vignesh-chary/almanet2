import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../../context/ThemeContext";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom";

const JobList = ({ searchTerm, filters, isDarkMode }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs", searchTerm, filters],
    queryFn: async () => {
      const params = {
        search: searchTerm,
        ...filters,
        page: 1,
        limit: 10
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      console.log("Sending request with params:", params);
      
      try {
        const response = await axiosInstance.get("/jobs", { params });
        console.log("Received response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error in API call:", error.response?.data || error.message);
        throw error;
      }
    },
    keepPreviousData: true,
    staleTime: 30000,
  });

  // Debug logs for state changes
  React.useEffect(() => {
    console.log("Current filters:", filters);
    console.log("Current search term:", searchTerm);
  }, [filters, searchTerm]);

  // Ensure jobs is always an array
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];

  if (isLoading) return (
    <div className={`flex justify-center items-center min-h-[400px] ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <div className={`w-8 h-8 border-4 ${
        isDarkMode ? 'border-primary-dark' : 'border-primary'
      } border-dotted rounded-full animate-spin`}></div>
    </div>
  );

  if (error) {
    console.error("Error in JobList:", error);
    return (
      <div className={`p-6 ${
        isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'
      }`}>
        <p className="text-error">Error loading jobs: {error.message}</p>
        <p className="text-error mt-2">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p className={`text-center py-8 ${
          isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
        }`}>
          No jobs found matching your criteria.
        </p>
      ) : (
        jobs.map((job) => (
          <Link
            key={job._id}
            to={`/jobs/${job._id}`}
            className={`block p-6 rounded-xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-card-dark border border-border-dark hover:bg-card-dark/80 hover:shadow-lg' 
                : 'bg-white border border-border hover:bg-gray-50 hover:shadow-lg'
            } shadow-sm`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-text-dark' : 'text-text'
                  }`}>
                    {job.title}
                  </h3>
                  <p className={`mt-1 ${
                    isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
                  }`}>
                    {job.postedBy?.name || 'Company not specified'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDarkMode 
                    ? job.jobType === "Full-time" 
                      ? "bg-success-dark text-white"
                      : job.jobType === "Part-time"
                      ? "bg-purple-600 text-white"
                      : job.jobType === "Contract"
                      ? "bg-blue-600 text-white"
                      : "bg-pink-600 text-white"
                    : job.jobType === "Full-time"
                    ? "bg-success text-white"
                    : job.jobType === "Part-time"
                    ? "bg-purple-500 text-white"
                    : job.jobType === "Contract"
                    ? "bg-blue-500 text-white"
                    : "bg-pink-500 text-white"
                }`}>
                  {job.jobType}
                </span>
              </div>

              <div className={`space-y-2 ${
                isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
              }`}>
                <p className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {job.location}
                </p>
                <p className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {job.experienceLevel}
                </p>
                {job.salary && (
                  <p className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ${job.salary.toLocaleString()}
                  </p>
                )}
              </div>

              <p className={`line-clamp-2 ${
                isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
              }`}>
                {job.description}
              </p>

              <div className="flex justify-between items-center">
                <span className={`text-sm ${
                  isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
                }`}>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isDarkMode
                      ? 'bg-primary-dark text-white'
                      : 'bg-primary text-white'
                  }`}
                >
                  View Details
                </button>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default JobList;
