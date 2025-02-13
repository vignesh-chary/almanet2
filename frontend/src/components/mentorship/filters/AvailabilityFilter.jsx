import React from "react";

const AvailabilityFilter = ({ filters, setFilters }) => {
  const availabilityOptions = ["Now", "Today", "This Week", "This Month", "Flexible"];

  return (
    <select
      className="w-full p-3 border border-[#d0dbe7] rounded-xl bg-white focus:outline-none focus:border-[#1980e6]"
      value={filters.availability}
      onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
    >
      <option value="">Select Availability</option>
      {availabilityOptions.map((availability) => (
        <option key={availability} value={availability}>
          {availability}
        </option>
      ))}
    </select>
  );
};

export default AvailabilityFilter;
