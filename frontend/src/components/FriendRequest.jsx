import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Link } from "react-router-dom";
import { UserCheck, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";

const FriendRequest = ({ request }) => {
	const queryClient = useQueryClient();
	const [localRequest, setLocalRequest] = useState(request);
	
	// Update local request when prop changes
	useEffect(() => {
		setLocalRequest(request);
	}, [request]);
	
	const acceptRequestMutation = useMutation({
		mutationFn: async () => {
			const res = await axiosInstance.put(`/connections/accept/${localRequest._id}`);
			return res.data;
		},
		onSuccess: () => {
			toast.success("Connection request accepted!");
			// Invalidate queries to refresh data
			queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
			queryClient.invalidateQueries({ queryKey: ["connections"] });
			// Update local state to prevent UI flicker
			setLocalRequest(prev => ({ ...prev, status: "accepted" }));
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Failed to accept connection request");
		},
	});

	const rejectRequestMutation = useMutation({
		mutationFn: async () => {
			const res = await axiosInstance.put(`/connections/reject/${localRequest._id}`);
			return res.data;
		},
		onSuccess: () => {
			toast.success("Connection request rejected");
			// Invalidate queries to refresh data
			queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
			// Update local state to prevent UI flicker
			setLocalRequest(prev => ({ ...prev, status: "rejected" }));
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Failed to reject connection request");
		},
	});

	const handleAcceptRequest = () => {
		acceptRequestMutation.mutate();
	};

	const handleRejectRequest = () => {
		rejectRequestMutation.mutate();
	};

	// If request has been processed, don't render
	if (localRequest.status === "accepted" || localRequest.status === "rejected") {
		return null;
	}

	return (
		<div className="flex min-w-[960px] max-w-[960px] items-center justify-between bg-background dark:bg-background-dark px-4 py-2 transition-colors duration-300">
			<div className="flex items-center gap-4">
				<Link to={`/profile/${localRequest.sender.username}`} className="flex-shrink-0">
					<img
						src={localRequest.sender.profilePicture || "/default-avatar.png"}
						alt={localRequest.sender.name}
						className="h-14 w-14 rounded-full object-cover"
					/>
				</Link>
				<div className="flex flex-col justify-center">
					<Link to={`/profile/${localRequest.sender.username}`} className="text-text dark:text-text-dark text-base font-medium leading-normal hover:underline transition-colors duration-300">
						{localRequest.sender.name}
					</Link>
					<p className="text-text-muted dark:text-text-dark-muted text-sm font-normal leading-normal transition-colors duration-300">{localRequest.sender.headline || "No headline"}</p>
				</div>
			</div>

			<div className="shrink-0">
				<div className="flex gap-2">
					<button
						onClick={handleAcceptRequest}
						className="flex min-w-[84px] items-center justify-center rounded-xl bg-secondary dark:bg-secondary-dark px-4 py-2 text-text dark:text-text-dark text-sm font-medium leading-normal hover:bg-border dark:hover:bg-border-dark transition-colors duration-300"
					>
						<UserCheck size={16} className="mr-2" />
						<span>Accept</span>
					</button>
					<button
						onClick={handleRejectRequest}
						className="flex min-w-[84px] items-center justify-center rounded-xl bg-secondary dark:bg-secondary-dark px-4 py-2 text-text dark:text-text-dark text-sm font-medium leading-normal hover:bg-border dark:hover:bg-border-dark transition-colors duration-300"
					>
						<X size={16} className="mr-2" />
						<span>Ignore</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default FriendRequest;
