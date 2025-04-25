import React from "react";
import { useTheme } from "../../context/ThemeContext";

const JobSearchBar = ({ searchTerm, setSearchTerm, isDarkMode }) => {
  return (
    <div className="relative flex-grow">
      <input
        type="text"
        placeholder="Search jobs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`w-full p-3 pl-10 rounded-lg border ${
          isDarkMode
            ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
            : 'bg-white border-border text-text placeholder-text-muted'
        } focus:outline-none focus:ring-2 focus:ring-primary`}
      />
      <svg
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
          isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default JobSearchBar;
