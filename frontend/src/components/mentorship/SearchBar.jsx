import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, onSearch }) => {
  return (
    <div className="relative w-full">
      <div className="flex w-full items-center bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-white/50 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all group">
        <div className="pl-6">
          <Search className="w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search by name, expertise, industry, or keywords..."
          className="flex-1 py-5 px-4 text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none text-lg font-light tracking-wide"
          value={value}
          onChange={onChange}
          onKeyPress={(e) => e.key === "Enter" && onSearch()}
        />
        <button
          className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.98] relative overflow-hidden group"
          onClick={onSearch}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-indigo-400/25 to-indigo-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          <span className="flex items-center gap-2 relative z-10">
            <span>Search</span>
            <Search className="w-4 h-4" />
          </span>
        </button>
      </div>
      <div className="absolute -bottom-7 left-0 right-0 text-center">
        <p className="text-sm text-indigo-200 font-light tracking-wide">
          Press Enter to search or use the search button
        </p>
      </div>
    </div>
  );
};

export default SearchBar;