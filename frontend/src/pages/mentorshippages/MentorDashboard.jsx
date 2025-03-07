import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom";
import MenteeCard from "../../components/mentorship/MenteeCard.jsx";

const MentorshipDashboard = () => {
  // Fetch mentees data with proper error handling
  const { data: mentees = [], isLoading, error } = useQuery({
    queryKey: ["mentees"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/mentorships/mentees");
        // console.log("API Response:", response.data); // Debug API response
        return response.data;
      } catch (err) {
        console.error("Error fetching mentees:", err);
        throw err;
      }
    },
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mentorship Dashboard</h1>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800">Total Mentees</h3>
          <p className="text-2xl font-bold">{mentees?.length || 0}</p>
        </div>
        {/* <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
          <h3 className="text-lg font-medium text-green-800">Active Mentees</h3>
          <p className="text-2xl font-bold">
            {mentees?.filter(m => m.status === 'active')?.length || 0}
          </p>
        </div> */}
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-medium text-purple-800">Upcoming Sessions</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-6">
        <Link to="/mentorship-requests" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          View Pending Requests
        </Link>
        {/* <Link to="/find-mentees" className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition">
          Find New Mentees
        </Link> */}
      </div>

      {/* Current Mentees */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Mentees</h2>
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
            <p className="font-medium">Error loading mentees</p>
            <p className="text-sm">{error.message || "Please try again later"}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentees && mentees.length > 0 ? (
              mentees.map((mentee, index) => (
                <MenteeCard key={mentee._id || `mentee-${index}`} mentee={mentee} />
              ))
            ) : (
              <div className="col-span-2 bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-600 mb-4">You don't have any mentees yet.</p>
                <Link to="/find-mentees" className="bg-blue-500 text-white px-4 py-2 rounded inline-block hover:bg-blue-600 transition">
                  Find Mentees
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipDashboard;