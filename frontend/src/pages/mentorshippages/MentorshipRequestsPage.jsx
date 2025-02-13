import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

const fetchMentorshipRequests = async () => {
  const { data } = await axiosInstance.get("/mentorships/requests");
  return data;
};

const updateMentorshipStatus = async ({ mentorshipId, status }) => {
  await axiosInstance.put(`/mentorships/${mentorshipId}/status`, { status });
};

export default function MentorshipRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["mentorshipRequests"],
    queryFn: fetchMentorshipRequests,
  });

  const { mutate } = useMutation({
    mutationFn: updateMentorshipStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["mentorshipRequests"]);
    },
  });

  const handleStatusChange = (mentorshipId, newStatus) => {
    mutate({ mentorshipId, status: newStatus });
  };

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error fetching data.</p>;

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 overflow-x-hidden font-manrope">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="max-w-[960px] flex-1">
            <div className="flex justify-between gap-3 p-4">
              <p className="text-4xl font-black tracking-tight">Mentorship Requests</p>
            </div>

            {/* Table */}
            <div className="px-4 py-3">
              <div className="overflow-hidden rounded-xl border border-[#d0dbe7] bg-white">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Mentee</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Message</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests?.map((request) => (
                      <tr key={request._id} className="border-t border-[#d0dbe7]">
                        <td className="px-4 py-2 text-sm flex items-center space-x-3">
                          <img
                            src={request.mentee?.profilePicture || "/default-avatar.png"}
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                          />
                          <span>{request.mentee?.username || "Unknown"}</span> {/* Display username */}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#4e7397]">{request.message}</td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`h-8 px-4 rounded-xl text-sm font-medium w-full ${
                              request.status === "accepted"
                                ? "bg-green-200"
                                : request.status === "rejected"
                                ? "bg-red-200"
                                : request.status === "completed"
                                ? "bg-blue-200"
                                : "bg-[#e7edf3]"
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-[#4e7397]">
                          {request.status === "pending" ? (
                            <>
                              <button
                                className="mr-2 text-green-600 hover:underline"
                                onClick={() => handleStatusChange(request._id, "accepted")}
                              >
                                Accept
                              </button>
                              <button
                                className="text-red-600 hover:underline"
                                onClick={() => handleStatusChange(request._id, "rejected")}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}