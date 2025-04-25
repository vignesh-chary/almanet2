
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar = ({ fullWidth }) => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
        }
    };

    return (
        <div
            className={`flex items-center ${fullWidth ? "w-full" : "w-64"} bg-secondary rounded-full px-3 transition-all
                ${isFocused ? "border-[2px] border-[#C29955]" : "border border-transparent"}`}
        >
            <form onSubmit={handleSearch} className="w-full">
                <div className="relative w-full">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none placeholder:text-accent text-dark font-sans"
                    />
                </div>
            </form>
        </div>
    );
};

export default SearchBar;