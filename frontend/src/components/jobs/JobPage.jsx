import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import JobSearchBar from "./JobSearchBar";
import JobFilter from "./JobFilter";
import JobList from "./JobList";

const JobPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const navigate = useNavigate(); // Initialize navigate function

  return (
    <div className="flex flex-col gap-8 p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <h1 className="text-3xl font-bold text-gray-800">Job Opportunities</h1>

        {/* Search Bar */}
        <JobSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Button to navigate to My Applied Jobs */}
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => navigate("/my-applied-jobs")}
        >
          View My Applied Jobs
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg lg:w-1/3 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Filter Jobs</h2>
          <JobFilter filters={filters} setFilters={setFilters} />
        </div>

        {/* Job List Section */}
        <div className="flex-grow bg-white p-6 rounded-lg shadow-lg">
          <JobList searchTerm={searchTerm} filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default JobPage;
