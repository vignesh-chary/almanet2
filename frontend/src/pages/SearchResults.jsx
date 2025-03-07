import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import RecommendedUser from "../components/RecommendedUser";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (!query) return []; // Important: Handle empty query case

      try {
        const { data } = await axiosInstance.get(`/users/search?query=${query}`);
        return data;
      } catch (error) {
        console.error("Error fetching search results:", error); // Log the error
        throw error; // Re-throw the error to be caught by react-query
      }
    },
    enabled: !!query, // Only run the query if 'query' is not empty
    retry: false, // Prevent automatic retries on error (optional)
  });

  if (!query) {
    return (
      <div className='container mx-auto p-4 max-w-3xl'>
        <h2 className='text-2xl font-semibold mb-6'>Search</h2>
        <p>Please enter a search term.</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 max-w-3xl'>
      <h2 className='text-2xl font-semibold mb-6'>
        Search Results for "{query}"
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500">Error loading search results. Please try again.</div>
      ) : users?.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <RecommendedUser key={user._id} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No users found matching "{query}". Try different keywords or check the spelling.
        </div>
      )}
    </div>
  );
};

export default SearchResults;
