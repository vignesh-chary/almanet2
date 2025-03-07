import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim(); // Trim whitespace

    if (trimmedQuery) {
      navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`); // Encode the query
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input input-bordered w-64 md:w-80"
      />
      <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
        🔍
      </button>
    </form>
  );
};

export default SearchBar;