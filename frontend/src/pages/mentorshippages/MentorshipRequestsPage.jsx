import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Loader2, Users, CheckCircle2, XCircle, Clock, Filter, Search, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const fetchMentorshipRequests = async () => {
  const { data } = await axiosInstance.get("/mentorships/requests");
  return data;
};

const updateMentorshipStatus = async ({ mentorshipId, status }) => {
  await axiosInstance.put(`/mentorships/${mentorshipId}/status`, { status });
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-400",
      icon: Clock,
    },
    accepted: {
      bg: "bg-green-50 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      icon: CheckCircle2,
    },
    rejected: {
      bg: "bg-red-50 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      icon: XCircle,
    },
    completed: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
      icon: CheckCircle2,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <Icon size={14} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Add new query for fetching stats
const fetchMentorshipStats = async () => {
  const { data } = await axiosInstance.get("/mentorships/stats");
  return data;
};

export default function MentorshipRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading: isLoadingRequests, error: requestsError } = useQuery({
    queryKey: ["mentorshipRequests"],
    queryFn: fetchMentorshipRequests,
  });

  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ["mentorshipStats"],
    queryFn: fetchMentorshipStats,
  });

  const { mutate, isLoading: isUpdating } = useMutation({
    mutationFn: updateMentorshipStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["mentorshipRequests"]);
      queryClient.invalidateQueries(["mentorshipStats"]);
    },
  });

  const handleStatusChange = (mentorshipId, newStatus) => {
    mutate({ mentorshipId, status: newStatus });
  };

  if (isLoadingRequests || isLoadingStats) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-background dark:bg-background-dark">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full blur-xl" />
          <Loader2 size={40} className="animate-spin text-primary dark:text-primary-dark relative" />
        </div>
      </div>
    );
  }

  if (requestsError || statsError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-background dark:bg-background-dark">
        <div className="text-center">
          <div className="mb-4 text-error dark:text-error-dark">
            <AlertTriangle size={40} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">Error Loading Requests</h3>
          <p className="text-text-muted dark:text-text-dark-muted mb-4">{requestsError?.message || statsError?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark rounded-lg hover:bg-primary/20 dark:hover:bg-primary-dark/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text dark:text-text-dark">
            Mentorship Requests
          </h1>
          <p className="text-text-muted dark:text-text-dark-muted mt-2">
            Manage and respond to mentorship requests from potential mentees.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { 
              label: "Total Requests", 
              value: stats?.totalMentors || 0, 
              icon: Users,
              isLoading: isLoadingStats
            },
            { 
              label: "Pending", 
              value: requests?.filter(r => r.status === "pending").length || 0, 
              icon: Clock,
              isLoading: isLoadingRequests
            },
            { 
              label: "Accepted", 
              value: stats?.activeEngagements || 0, 
              icon: CheckCircle2,
              isLoading: isLoadingStats
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-card dark:bg-card-dark rounded-xl shadow-sm border border-border dark:border-border-dark p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 dark:bg-primary-dark/20 rounded-lg">
                  <stat.icon size={24} className="text-primary dark:text-primary-dark" />
                </div>
              </div>
              {stat.isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-secondary/20 dark:bg-secondary-dark/20 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-secondary/20 dark:bg-secondary-dark/20 rounded w-3/4"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-text dark:text-text-dark">{stat.value}</h3>
                  <p className="text-sm text-text-muted dark:text-text-dark-muted mt-1">{stat.label}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Requests Table */}
        <div className="bg-card dark:bg-card-dark rounded-xl shadow-sm border border-border dark:border-border-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-border-dark bg-secondary dark:bg-secondary-dark/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text dark:text-text-dark">Mentee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text dark:text-text-dark">Message</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text dark:text-text-dark">Requested</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text dark:text-text-dark">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text dark:text-text-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {requests?.map((request) => (
                  <tr key={request._id} className="hover:bg-secondary/50 dark:hover:bg-secondary-dark/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.mentee?.profilePicture || "/default-avatar.png"}
                          alt={request.mentee?.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-card dark:border-card-dark shadow-sm"
                        />
                        <div>
                          <div className="font-medium text-text dark:text-text-dark">{request.mentee?.username}</div>
                          <div className="text-sm text-text-muted dark:text-text-dark-muted">{request.mentee?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-muted dark:text-text-dark-muted line-clamp-2">{request.message}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted dark:text-text-dark-muted">
                      {request.createdAt ? format(new Date(request.createdAt), "MMM d, yyyy") : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4">
                      {request.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(request._id, "accepted")}
                            disabled={isUpdating}
                            className="px-3 py-1.5 text-sm font-medium text-success dark:text-success-dark bg-success/10 dark:bg-success-dark/20 rounded-lg hover:bg-success/20 dark:hover:bg-success-dark/30 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(request._id, "rejected")}
                            disabled={isUpdating}
                            className="px-3 py-1.5 text-sm font-medium text-error dark:text-error-dark bg-error/10 dark:bg-error-dark/20 rounded-lg hover:bg-error/20 dark:hover:bg-error-dark/30 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted dark:text-text-dark-muted">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {(!requests || requests.length === 0) && (
            <div className="text-center py-12">
              <Users size={40} className="mx-auto text-text-muted dark:text-text-dark-muted mb-4" />
              <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">No Requests Found</h3>
              <p className="text-text-muted dark:text-text-dark-muted">You don't have any mentorship requests yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}