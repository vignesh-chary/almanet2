import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { ExternalLink, Eye, MessageSquare, ThumbsUp, Trash2, UserPlus, ChevronDownCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { formatDistanceToNow } from "date-fns";
import { eventEmitter } from "../utils/eventEmitter";
import { useEffect } from "react";

const NotificationsPage = () => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const response = await axiosInstance.get("/notifications");
				return Array.isArray(response.data) ? { data: response.data } : response.data;
			} catch (error) {
				console.error("Error fetching notifications:", error);
				return { data: [] };
			}
		},
		staleTime: 0,
		cacheTime: Infinity,
		refetchOnWindowFocus: true,
		refetchOnMount: true,
	});

	useEffect(() => {
		const handleNotificationsUpdate = (newNotifications) => {
			const normalizedNotifications = Array.isArray(newNotifications) ? newNotifications : newNotifications.data;
			queryClient.setQueryData(["notifications"], { data: normalizedNotifications });
		};

		eventEmitter.on("notifications_updated", handleNotificationsUpdate);

		return () => {
			eventEmitter.off("notifications_updated", handleNotificationsUpdate);
		};
	}, [queryClient]);

	const updateNotifications = (newNotifications) => {
		const normalizedNotifications = Array.isArray(newNotifications) ? newNotifications : newNotifications.data;
		queryClient.setQueryData(["notifications"], { data: normalizedNotifications });
		eventEmitter.emit("notifications_updated", normalizedNotifications);
	};

	const { mutate: markAsReadMutation } = useMutation({
		mutationFn: (id) => axiosInstance.put(`/notifications/${id}/read`),
		onSuccess: (_, id) => {
			if (!notifications?.data) return;
			const updatedNotifications = notifications.data.map(notification =>
				notification._id === id ? { ...notification, read: true } : notification
			);
			updateNotifications(updatedNotifications);
		},
	});

	const { mutate: deleteNotificationMutation } = useMutation({
		mutationFn: (id) => axiosInstance.delete(`/notifications/${id}`),
		onSuccess: (_, id) => {
			if (!notifications?.data) return;
			const updatedNotifications = notifications.data.filter(
				notification => notification._id !== id
			);
			updateNotifications(updatedNotifications);
			toast.success("Notification deleted");
		},
	});

	const { mutate: markAllAsReadMutation } = useMutation({
		mutationFn: async () => {
			if (!notifications?.data) return;
			const unreadNotifications = notifications.data.filter(notification => !notification.read);
			// Mark each unread notification as read
			await Promise.all(
				unreadNotifications.map(notification =>
					axiosInstance.put(`/notifications/${notification._id}/read`)
				)
			);
		},
		onSuccess: () => {
			if (!notifications?.data) return;
			const updatedNotifications = notifications.data.map(notification => ({
				...notification,
				read: true
			}));
			updateNotifications(updatedNotifications);
			toast.success("All notifications marked as read");
		},
		onError: (error) => {
			console.error("Error marking all notifications as read:", error);
			toast.error("Failed to mark all notifications as read");
		}
	});

	const renderNotificationIcon = (type) => {
		switch (type) {
			case "like":
				return <ThumbsUp className="text-primary" />;
			case "comment":
				return <MessageSquare className="text-primary" />;
			case "connectionAccepted":
				return <UserPlus className="text-primary" />;
			default:
				return null;
		}
	};

	const renderNotificationContent = (notification) => {
		if (!notification?.relatedUser) return null;

		switch (notification.type) {
			case "like":
				return (
					<span>
						<strong>{notification.relatedUser.name}</strong> liked your post
					</span>
				);
			case "comment":
				return (
					<span>
						<Link to={`/profile/${notification.relatedUser.username}`} className="font-bold">
							{notification.relatedUser.name}
						</Link>{" "}
						commented on your post
					</span>
				);
			case "connectionAccepted":
				return (
					<span>
						<Link to={`/profile/${notification.relatedUser.username}`} className="font-bold">
							{notification.relatedUser.name}
						</Link>{" "}
						accepted your connection request
					</span>
				);
			default:
				return null;
		}
	};

	const renderRelatedPost = (relatedPost) => {
		if (!relatedPost) return null;

		return (
			<Link
				to={`/post/${relatedPost._id}`}
				className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
				style={{ backgroundImage: `url(${relatedPost.image})` }}
			/>
		);
	};

	return (
		<div className="relative flex size-full min-h-screen flex-col bg-background dark:bg-background-dark group/design-root overflow-x-hidden">
			<div className="layout-container flex h-full grow flex-col">
				<div className="gap-1 px-6 flex flex-1 justify-center py-5">
					<div className="layout-content-container flex flex-col w-80">
						<Sidebar user={authUser} />
					</div>
					<div className="layout-content-container flex flex-col max-w-[960px] flex-1">
						<div className="flex flex-wrap justify-between gap-3 p-4">
							<div className="flex min-w-72 flex-col gap-3">
								<p className="text-text dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">Notifications</p>
								<p className="text-accent dark:text-accent-dark text-base font-normal leading-normal">Stay updated with your latest activity.</p>
							</div>
						</div>
						<div className="pb-3">
							<div className="flex border-b border-border dark:border-border-dark px-4 justify-between">
								<a className="flex flex-col items-center justify-center border-b-[3px] border-b-primary dark:border-b-primary-dark text-text dark:text-text-dark pb-[13px] pt-4 flex-1" href="#">
									<p className="text-text dark:text-text-dark text-sm font-bold leading-normal tracking-[0.015em]">All</p>
								</a>
							</div>
						</div>
						<div className="p-4">
							{isLoading ? (
								<p className="text-text dark:text-text-dark">Loading notifications...</p>
							) : notifications?.data?.length > 0 ? (
								notifications.data.map((notification) => (
									<div key={notification._id} className="mb-4">
										<div className="flex items-stretch justify-between gap-4 rounded-xl">
											<div className="flex flex-[2_2_0px] flex-col gap-4">
												<div className="flex flex-col gap-1">
													<p className="text-text dark:text-text-dark text-base font-bold leading-tight">
														{renderNotificationContent(notification)}
													</p>
													<p className="text-accent dark:text-accent-dark text-sm font-normal leading-normal">
														{formatDistanceToNow(new Date(notification.createdAt), {
															addSuffix: true,
														})}
													</p>
												</div>
												<div className="flex gap-2">
													{!notification.read && (
														<button
															onClick={() => markAsReadMutation(notification._id)}
															className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark pr-2 gap-1 text-sm font-medium leading-normal w-fit"
														>
															<Eye size={18} />
															<span className="truncate">Mark as Read</span>
														</button>
													)}
													<button
														onClick={() => deleteNotificationMutation(notification._id)}
														className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark pr-2 gap-1 text-sm font-medium leading-normal w-fit"
													>
														<Trash2 size={18} />
														<span className="truncate">Delete</span>
													</button>
												</div>
											</div>
											{renderRelatedPost(notification.relatedPost)}
										</div>
									</div>
								))
							) : (
								<p className="text-text dark:text-text-dark">No notifications at the moment.</p>
							)}
						</div>
						<div className="flex justify-end overflow-hidden px-5 pb-5">
							<button
								onClick={() => markAllAsReadMutation()}
								className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-primary dark:bg-primary-dark text-white text-base font-bold leading-normal tracking-[0.015em] min-w-0 gap-4 pl-4 pr-6"
							>
								<ChevronDownCircle size={24} />
								<span className="truncate">Mark All as Read</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotificationsPage;
