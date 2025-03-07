import React from "react";

const SearchBar = ({ value, onChange, onSearch }) => {
  return (
    <div className="flex w-full items-stretch rounded-lg overflow-hidden shadow-lg">
      <input
        type="text"
        placeholder="Search for a mentor by name or expertise..."
        className="flex-1 p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={onChange}
        onKeyPress={(e) => e.key === "Enter" && onSearch()}
      />
      <button
        className="bg-blue-600 text-white px-6 hover:bg-blue-700 transition-colors"
        onClick={onSearch}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;