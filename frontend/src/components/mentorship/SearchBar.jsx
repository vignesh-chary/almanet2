import React from "react";

const SearchBar = ({ value, onChange, onSearch }) => {
  return (
    <label className="flex flex-col min-w-40 h-14 w-full max-w-[480px]">
      <div className="flex w-full items-stretch rounded-xl h-full">
        <input
          type="text"
          placeholder="Search for a mentor"
          className="form-input flex w-full border border-gray-300 rounded-l-xl px-4 text-gray-800 focus:outline-none"
          value={value}
          onChange={onChange}
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-r-xl"
          onClick={onSearch}
        >
          Find a Mentor
        </button>
      </div>
    </label>
  );
};

export default SearchBar;
