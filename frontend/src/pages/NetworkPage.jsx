import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { UserPlus, Users, UserCheck, Loader2, Search } from "lucide-react";
import FriendRequest from "../components/FriendRequest";
import RecommendedUser from "../components/RecommendedUser";
import UserCard from "../components/UserCard";
import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "../hooks/useDebounce";

const NetworkPage = () => {
    const { data: user } = useQuery({ queryKey: ["authUser"] });
    const [activeTab, setActiveTab] = useState("requests");
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name"); // "name" or "recent"
    
    // Debounce search query to avoid too many API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Fetch user stats
    const { data: userStats, isLoading: isLoadingStats } = useQuery({
        queryKey: ["userStats", user?._id],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get(`/users/stats/${user._id}`);
                return res.data;
            } catch (err) {
                console.error("Error fetching user stats:", err);
                return {
                    profileViews: { total: 0, recent: 0, trend: 0 },
                    searchAppearances: { total: 0, recent: 0, trend: 0 },
                    connections: 0
                };
            }
        },
        enabled: !!user?._id,
    });

    // Fetch recommended users
    const { data: recommendedUsers, isLoading: isLoadingRecommended } = useQuery({
        queryKey: ["recommendedUsers", user?._id],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get(`/recommendations/${user._id}/recommendations`);
                return res.data;
            } catch (err) {
                console.error("Error fetching recommended users:", err);
                return [];
            }
        },
        enabled: !!user?._id,
    });

    // Fetch connection requests with improved error handling and retry logic
    const { data: connectionRequests, isLoading: isLoadingRequests, refetch: refetchRequests } = useQuery({
        queryKey: ["connectionRequests"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/connections/requests");
                return res.data;
            } catch (err) {
                console.error("Error fetching connection requests:", err);
                return [];
            }
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 30000,
        refetchOnWindowFocus: true,
    });

    // Fetch connections with search
    const { data: connections, isLoading: isLoadingConnections } = useQuery({
        queryKey: ["connections", debouncedSearchQuery],
        queryFn: async () => {
            try {
                const url = "/connections" + (debouncedSearchQuery.trim() ? `?query=${encodeURIComponent(debouncedSearchQuery.trim())}` : "");
                const res = await axiosInstance.get(url);
                return res.data;
            } catch (err) {
                console.error("Error fetching connections:", err);
                return [];
            }
        },
    });

    // Sort connections based on sort option
    const sortedConnections = useMemo(() => {
        if (!connections) return [];

        return [...connections].sort((a, b) => {
            if (sortBy === "name") {
                return (a.name || "").localeCompare(b.name || "");
            } else if (sortBy === "recent") {
                // Sort by the connection's connectedAt timestamp
                const dateA = new Date(a.connectedAt || 0);
                const dateB = new Date(b.connectedAt || 0);
                return dateB - dateA; // Most recent first
            }
            return 0;
        });
    }, [connections, sortBy]);

    // Set initial load flag to false after first render
    useEffect(() => {
        if (isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [isInitialLoad]);

    // Force refetch connection requests on component mount
    useEffect(() => {
        if (!isInitialLoad) {
            refetchRequests();
        }
    }, [isInitialLoad, refetchRequests]);

    // Handle search input change - update in real time
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
    };

    // Format number with K suffix
    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Render content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case "requests":
                return (
                    <>
                        {/* Connection Requests */}
                        <h2 className="text-text dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 transition-colors duration-300">Connection Requests</h2>
                        <div className="flex flex-col items-center space-y-4 px-4">
                            {isLoadingRequests ? (
                                <div className="flex min-w-[960px] max-w-[960px] items-center justify-center bg-background dark:bg-background-dark p-8 transition-colors duration-300">
                                    <Loader2 size={30} className="animate-spin text-primary dark:text-primary-dark transition-colors duration-300" />
                                </div>
                            ) : connectionRequests?.length > 0 ? (
                                connectionRequests.map((request) => (
                                    <FriendRequest key={request._id} request={request} />
                                ))
                            ) : (
                                <div className="flex min-w-[960px] max-w-[960px] items-center justify-center bg-background dark:bg-background-dark p-8 transition-colors duration-300">
                                    <p className="text-text-muted dark:text-text-dark-muted transition-colors duration-300">No pending connection requests</p>
                                </div>
                            )}
                        </div>

                        {/* Recommended Users */}
                        <h2 className="text-text dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-8 transition-colors duration-300">Recommended Users</h2>
                        <div className="flex flex-col items-center space-y-4 px-4">
                            {isLoadingRecommended ? (
                                <div className="flex min-w-[960px] max-w-[960px] items-center justify-center bg-background dark:bg-background-dark p-8 transition-colors duration-300">
                                    <Loader2 size={30} className="animate-spin text-primary dark:text-primary-dark transition-colors duration-300" />
                                </div>
                            ) : recommendedUsers?.length > 0 ? (
                                recommendedUsers.map((user) => (
                                    <RecommendedUser key={user._id} user={user} />
                                ))
                            ) : (
                                <div className="flex min-w-[960px] max-w-[960px] items-center justify-center bg-background dark:bg-background-dark p-8 transition-colors duration-300">
                                    <p className="text-text-muted dark:text-text-dark-muted transition-colors duration-300">No recommendations available</p>
                                </div>
                            )}
                        </div>
                    </>
                );
            case "connections":
                return (
                    <>
                        {/* Search and Sort */}
                        <div className="flex flex-col space-y-4 px-4 pb-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-text-dark-muted" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, headline, or username"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="h-12 w-full rounded-xl bg-secondary/10 dark:bg-secondary-dark/10 pl-12 pr-4 text-text dark:text-text-dark placeholder:text-text-muted dark:placeholder:text-text-dark-muted focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-300"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSortBy("name")}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                                        sortBy === "name"
                                        ? "bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark"
                                        : "text-text-muted dark:text-text-dark-muted hover:bg-secondary/10 dark:hover:bg-secondary-dark/10"
                                    }`}
                                >
                                    Name
                                </button>
                                <button
                                    onClick={() => setSortBy("recent")}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                                        sortBy === "recent"
                                        ? "bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark"
                                        : "text-text-muted dark:text-text-dark-muted hover:bg-secondary/10 dark:hover:bg-secondary-dark/10"
                                    }`}
                                >
                                    Recently Added
                                </button>
                            </div>
                        </div>

                        {/* Connections List */}
                        <div className="flex flex-col items-center space-y-4 px-4">
                            {isLoadingConnections ? (
                                <div className="flex min-w-[960px] max-w-[960px] items-center justify-center bg-background dark:bg-background-dark p-8 transition-colors duration-300">
                                    <Loader2 size={30} className="animate-spin text-primary dark:text-primary-dark transition-colors duration-300" />
                                </div>
                            ) : sortedConnections.length > 0 ? (
                                sortedConnections.map((connection) => (
                                    <UserCard key={connection._id} user={connection} />
                                ))
                            ) : (
                                <div className="flex min-w-[960px] max-w-[960px] items-center justify-center bg-background dark:bg-background-dark p-8 transition-colors duration-300">
                                    <p className="text-text-muted dark:text-text-dark-muted transition-colors duration-300">
                                        {searchQuery.trim() ? "No connections found matching your search" : "No connections yet"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                );
            case "insights":
                return (
                    <div className="flex min-w-[960px] max-w-[960px] items-center justify-center bg-background dark:bg-background-dark p-8 transition-colors duration-300">
                        <p className="text-text-muted dark:text-text-dark-muted transition-colors duration-300">Insights coming soon</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-background dark:bg-background-dark transition-colors duration-300">
            <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col py-8">
                {/* Dashboard Stats */}
                <div className="flex flex-wrap gap-4 p-4">
                    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-6 transition-colors duration-300">
                        <p className="text-text dark:text-text-dark text-base font-medium leading-normal transition-colors duration-300">Profile Views</p>
                        {isLoadingStats ? (
                            <Loader2 size={24} className="animate-spin text-primary dark:text-primary-dark" />
                        ) : (
                            <>
                                <p className="text-text dark:text-text-dark tracking-light text-2xl font-bold leading-tight transition-colors duration-300">
                                    {formatNumber(userStats?.profileViews?.recent || 0)}
                                </p>
                                <p className={`text-base font-medium leading-normal transition-colors duration-300 ${
                                    userStats?.profileViews?.trend >= 0 
                                    ? "text-primary dark:text-primary-dark" 
                                    : "text-red-500 dark:text-red-400"
                                }`}>
                                    {userStats?.profileViews?.trend >= 0 ? '+' : ''}{userStats?.profileViews?.trend || 0}%
                                </p>
                            </>
                        )}
                    </div>
                    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-6 transition-colors duration-300">
                        <p className="text-text dark:text-text-dark text-base font-medium leading-normal transition-colors duration-300">Search Appearances</p>
                        {isLoadingStats ? (
                            <Loader2 size={24} className="animate-spin text-primary dark:text-primary-dark" />
                        ) : (
                            <>
                                <p className="text-text dark:text-text-dark tracking-light text-2xl font-bold leading-tight transition-colors duration-300">
                                    {formatNumber(userStats?.searchAppearances?.recent || 0)}
                                </p>
                                <p className={`text-base font-medium leading-normal transition-colors duration-300 ${
                                    userStats?.searchAppearances?.trend >= 0 
                                    ? "text-primary dark:text-primary-dark" 
                                    : "text-red-500 dark:text-red-400"
                                }`}>
                                    {userStats?.searchAppearances?.trend >= 0 ? '+' : ''}{userStats?.searchAppearances?.trend || 0}%
                                </p>
                            </>
                        )}
                    </div>
                    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-6 transition-colors duration-300">
                        <p className="text-text dark:text-text-dark text-base font-medium leading-normal transition-colors duration-300">Connections</p>
                        {isLoadingStats ? (
                            <Loader2 size={24} className="animate-spin text-primary dark:text-primary-dark" />
                        ) : (
                            <>
                                <p className="text-text dark:text-text-dark tracking-light text-2xl font-bold leading-tight transition-colors duration-300">
                                    {userStats?.connections || 0}
                                </p>
                                <p className="text-primary dark:text-primary-dark text-base font-medium leading-normal transition-colors duration-300">
                                    Active
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Activity Tabs */}
                <div className="pb-3">
                    <div className="flex border-b border-border dark:border-border-dark px-4 gap-8 transition-colors duration-300">
                        <button 
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors duration-300 ${
                                activeTab === "requests" 
                                ? "border-b-primary dark:border-b-primary-dark text-text dark:text-text-dark" 
                                : "border-b-transparent text-text-muted dark:text-text-dark-muted"
                            }`}
                            onClick={() => setActiveTab("requests")}
                        >
                            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Activity</p>
                        </button>
                        <button 
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors duration-300 ${
                                activeTab === "connections" 
                                ? "border-b-primary dark:border-b-primary-dark text-text dark:text-text-dark" 
                                : "border-b-transparent text-text-muted dark:text-text-dark-muted"
                            }`}
                            onClick={() => setActiveTab("connections")}
                        >
                            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Connections</p>
                        </button>
                        <button 
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors duration-300 ${
                                activeTab === "insights" 
                                ? "border-b-primary dark:border-b-primary-dark text-text dark:text-text-dark" 
                                : "border-b-transparent text-text-muted dark:text-text-dark-muted"
                            }`}
                            onClick={() => setActiveTab("insights")}
                        >
                            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Insights</p>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </div>
    );
};

export default NetworkPage;