import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Link } from "react-router-dom";
import { UserPlus, Users, UserCheck, Loader2, Check, Clock, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState } from "react";

const RecommendedUser = ({ user }) => {
    const queryClient = useQueryClient();
    const [localStatus, setLocalStatus] = useState(null);
    
    // Check connection status
    const { data: connectionStatus, isLoading: isLoadingStatus } = useQuery({
        queryKey: ["connectionStatus", user._id],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get(`/connections/status/${user._id}`);
                return res.data;
            } catch (err) {
                console.error("Error checking connection status:", err);
                return { status: "none" };
            }
        },
    });

    // Fetch profile picture
    const { data: profilePictureData, isLoading: isLoadingPicture, error: pictureError } = useQuery({
        queryKey: ["profilePicture", user.username],
        queryFn: async () => {
            try {
                console.log("Fetching profile picture for:", user.username);
                const res = await axiosInstance.get(`/users/profile-picture/${user.username}`);
                console.log("Profile picture response:", res.data);
                return res.data;
            } catch (err) {
                // If it's a 404, just return null without logging an error
                if (err.response?.status === 404) {
                    console.log(`No profile picture found for user: ${user.username}`);
                    return { profilePicture: null };
                }
                console.error("Error fetching profile picture:", err.response?.data?.message || err.message);
                return { profilePicture: null };
            }
        },
        enabled: !!user.username,
        retry: 0, // Don't retry on failure since 404s are expected
    });

    // Debug logs
    console.log("User data:", user);
    console.log("Profile picture data:", profilePictureData);
    console.log("Picture error:", pictureError);

    // Send connection request mutation
    const sendRequestMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.post(`/connections/request/${user._id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Connection request sent successfully!");
            setLocalStatus("pending");
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
            queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to send connection request");
        },
    });

    // Accept connection request mutation
    const acceptRequestMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.put(`/connections/accept/${connectionStatus?.requestId || user._id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Connection request accepted!");
            setLocalStatus("connected");
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
            queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
            queryClient.invalidateQueries({ queryKey: ["connections"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to accept connection request");
        },
    });

    // Reject connection request mutation
    const rejectRequestMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.put(`/connections/reject/${connectionStatus?.requestId || user._id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Connection request rejected");
            setLocalStatus("none");
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
            queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to reject connection request");
        },
    });

    const handleSendRequest = () => {
        sendRequestMutation.mutate();
    };

    const handleAcceptRequest = () => {
        acceptRequestMutation.mutate();
    };

    const handleRejectRequest = () => {
        rejectRequestMutation.mutate();
    };

    // Use local status if available, otherwise use the fetched status
    const currentStatus = localStatus || connectionStatus?.status || "none";
    const requestId = connectionStatus?.requestId;

    return (
        <div className="flex min-w-[960px] max-w-[960px] items-center justify-between bg-background dark:bg-background-dark px-4 py-2 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <Link to={`/profile/${user.username}`} className="flex-shrink-0">
                    {isLoadingPicture ? (
                        <div className="h-14 w-14 rounded-full bg-secondary dark:bg-secondary-dark animate-pulse" />
                    ) : (
                        <img
                            src={
                                (typeof profilePictureData === 'object' ? profilePictureData?.profilePicture : profilePictureData) || 
                                user.profilePicture || 
                                `https://ui-avatars.com/api/?name=${user.name || 'Anonymous'}&background=random`
                            }
                            alt={user.name}
                            className="h-14 w-14 rounded-full object-cover"
                            onError={(e) => {
                                console.log("Image load error, falling back to avatar");
                                e.target.src = `https://ui-avatars.com/api/?name=${user.name || 'Anonymous'}&background=random`;
                            }}
                        />
                    )}
                </Link>
                <div className="flex flex-col justify-center">
                    <Link to={`/profile/${user.username}`} className="text-text dark:text-text-dark text-base font-medium leading-normal hover:underline transition-colors duration-300">
                        {user.name}
                    </Link>
                    <p className="text-text-muted dark:text-text-dark-muted text-sm font-normal leading-normal transition-colors duration-300">{user.headline || "No headline"}</p>
                </div>
            </div>

            <div className="shrink-0">
                {isLoadingStatus ? (
                    <button disabled className="flex min-w-[140px] items-center justify-center rounded-xl bg-secondary dark:bg-secondary-dark px-4 py-2 text-text dark:text-text-dark text-sm font-medium leading-normal transition-colors duration-300">
                        <Loader2 size={16} className="animate-spin mr-2" />
                        <span>Loading...</span>
                    </button>
                ) : currentStatus === "pending" ? (
                    <button disabled className="flex min-w-[140px] items-center justify-center rounded-xl bg-secondary dark:bg-secondary-dark px-4 py-2 text-text dark:text-text-dark text-sm font-medium leading-normal transition-colors duration-300">
                        <Clock size={16} className="mr-2" />
                        <span>Request Sent</span>
                    </button>
                ) : currentStatus === "received" ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleAcceptRequest}
                            className="flex min-w-[140px] items-center justify-center rounded-xl bg-primary dark:bg-primary-dark px-4 py-2 text-white hover:bg-primary-dark dark:hover:bg-primary text-sm font-medium leading-normal transition-colors duration-300"
                        >
                            <Check size={16} className="mr-2" />
                            <span>Accept</span>
                        </button>
                        <button
                            onClick={handleRejectRequest}
                            className="flex min-w-[140px] items-center justify-center rounded-xl bg-secondary dark:bg-secondary-dark px-4 py-2 text-text dark:text-text-dark text-sm font-medium leading-normal hover:bg-border dark:hover:bg-border-dark transition-colors duration-300"
                        >
                            <X size={16} className="mr-2" />
                            <span>Ignore</span>
                        </button>
                    </div>
                ) : currentStatus === "connected" ? (
                    <button disabled className="flex min-w-[140px] items-center justify-center rounded-xl bg-secondary dark:bg-secondary-dark px-4 py-2 text-text dark:text-text-dark text-sm font-medium leading-normal transition-colors duration-300">
                        <Users size={16} className="mr-2" />
                        <span>Connected</span>
                    </button>
                ) : (
                    <button
                        onClick={handleSendRequest}
                        className="flex min-w-[140px] items-center justify-center rounded-xl bg-secondary dark:bg-secondary-dark px-4 py-2 text-text dark:text-text-dark text-sm font-medium leading-normal hover:bg-border dark:hover:bg-border-dark transition-colors duration-300"
                    >
                        <UserPlus size={16} className="mr-2" />
                        <span>Connect</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default RecommendedUser;