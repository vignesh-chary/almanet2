import React from "react";

const JobFilter = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full lg:w-80">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Filters</h3>
      
      {/* Location Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          name="location"
          placeholder="Enter location"
          className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          onChange={handleChange}
        />
      </div>

      {/* Job Type Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Type
        </label>
        <select
          name="jobType"
          className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value="Full-time">Full-Time</option>
          <option value="Part-time">Part-Time</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      {/* Placeholder for Additional Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Filter (e.g., Salary Range)
        </label>
        <input
          type="text"
          name="additionalFilter"
          placeholder="Optional"
          className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default JobFilter;
