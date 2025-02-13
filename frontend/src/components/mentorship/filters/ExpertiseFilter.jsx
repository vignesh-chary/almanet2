import React from "react";

const ExpertiseFilter = ({ filters, setFilters }) => {
  const expertiseOptions = ["Product Management", "Software Engineering", "UI/UX Design", "Data Science"];

  return (
    <select
      className="w-full p-3 border border-[#d0dbe7] rounded-xl bg-white focus:outline-none focus:border-[#1980e6]"
      value={filters.expertise}
      onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
    >
      <option value="">Select Expertise</option>
      {expertiseOptions.map((expertise) => (
        <option key={expertise} value={expertise}>
          {expertise}
        </option>
      ))}
    </select>
  );
};

export default ExpertiseFilter;
