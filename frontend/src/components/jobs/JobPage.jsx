import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import JobSearchBar from "./JobSearchBar";
import JobFilter from "./JobFilter";
import JobList from "./JobList";
import RecommendedJobs from "./RecommendedJobs";

const JobPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background-dark' : 'bg-background'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommended Jobs Section */}
        <RecommendedJobs isDarkMode={isDarkMode} />

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
            Job Opportunities
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search Bar */}
            <JobSearchBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              isDarkMode={isDarkMode}
            />

            {/* Button to navigate to My Applied Jobs */}
            <button
              className={`px-6 py-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-primary-dark text-white' 
                  : 'bg-primary text-white'
              }`}
              onClick={() => navigate("/my-applied-jobs")}
            >
              View My Applied Jobs
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Section */}
          <div className={`lg:w-1/3 flex-shrink-0 ${
            isDarkMode ? 'bg-background-dark' : 'bg-background'
          } p-6 rounded-xl`}>
            <h2 className={`text-xl font-semibold mb-6 ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              Filter Jobs
            </h2>
            <JobFilter filters={filters} setFilters={setFilters} isDarkMode={isDarkMode} />
          </div>

          {/* Job List Section */}
          <div className={`flex-grow ${
            isDarkMode ? 'bg-background-dark' : 'bg-background'
          } p-6 rounded-xl`}>
            <JobList searchTerm={searchTerm} filters={filters} isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPage;
