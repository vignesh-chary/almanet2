import React from "react";
import { useTheme } from "../../context/ThemeContext";

const JobFilter = ({ filters, setFilters, isDarkMode }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (value === "") {
        delete newFilters[name];
      } else {
        newFilters[name] = value;
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6">
      <div>
        <label className={`block mb-2 font-medium ${
          isDarkMode ? 'text-text-dark' : 'text-text'
        }`}>
          Job Type
        </label>
        <select
          name="jobType"
          value={filters.jobType || ""}
          onChange={handleFilterChange}
          className={`w-full p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-background-dark border-border-dark text-text-dark' 
              : 'bg-white border-border text-text'
          } focus:outline-none focus:ring-2 focus:ring-primary`}
        >
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      <div>
        <label className={`block mb-2 font-medium ${
          isDarkMode ? 'text-text-dark' : 'text-text'
        }`}>
          Experience Level
        </label>
        <select
          name="experienceLevel"
          value={filters.experienceLevel || ""}
          onChange={handleFilterChange}
          className={`w-full p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-background-dark border-border-dark text-text-dark' 
              : 'bg-white border-border text-text'
          } focus:outline-none focus:ring-2 focus:ring-primary`}
        >
          <option value="">All Levels</option>
          <option value="Entry">Entry</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>
      </div>

      <div>
        <label className={`block mb-2 font-medium ${
          isDarkMode ? 'text-text-dark' : 'text-text'
        }`}>
          Location
        </label>
        <input
          type="text"
          name="location"
          placeholder="Enter location"
          value={filters.location || ""}
          onChange={handleFilterChange}
          className={`w-full p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted' 
              : 'bg-white border-border text-text placeholder-text-muted'
          } focus:outline-none focus:ring-2 focus:ring-primary`}
        />
      </div>

      {/* Salary Range Filter - Commented out for now
      <div>
        <label className={`block mb-2 font-medium ${
          isDarkMode ? 'text-text-dark' : 'text-text'
        }`}>
          Salary Range
        </label>
        <select
          name="salaryRange"
          value={filters.salaryRange || ""}
          onChange={handleFilterChange}
          className={`w-full p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-background-dark border-border-dark text-text-dark' 
              : 'bg-white border-border text-text'
          } focus:outline-none focus:ring-2 focus:ring-primary`}
        >
          <option value="">All Ranges</option>
          <option value="0-30000">$0 - $30,000</option>
          <option value="30000-60000">$30,000 - $60,000</option>
          <option value="60000-90000">$60,000 - $90,000</option>
          <option value="90000+">$90,000+</option>
        </select>
      </div>
      */}

      <button
        onClick={clearFilters}
        className={`w-full py-3 px-6 rounded-lg font-medium ${
          isDarkMode
            ? 'bg-secondary-dark text-white'
            : 'bg-primary text-white'
        }`}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default JobFilter;
