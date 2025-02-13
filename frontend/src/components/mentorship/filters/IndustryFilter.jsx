import React from "react";

const IndustryFilter = ({ filters, setFilters }) => {
  const industryOptions = ["Technology", "Finance", "Healthcare", "Education", "Retail"];

  return (
    <select
      className="w-full p-3 border border-[#d0dbe7] rounded-xl bg-white focus:outline-none focus:border-[#1980e6]"
      value={filters.industry}
      onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
    >
      <option value="">Select Industry</option>
      {industryOptions.map((industry) => (
        <option key={industry} value={industry}>
          {industry}
        </option>
      ))}
    </select>
  );
};

export default IndustryFilter;
