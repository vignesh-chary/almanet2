import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

const AdminSidebar = () => {
    const location = useLocation();
    const { isDarkMode } = useTheme();

    // Fetch user data to check admin status
    const { data: userData } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            const response = await axiosInstance.get("/auth/me");
            return response.data;
        },
    });

    // If user is not admin, don't render the sidebar
    if (userData?.role !== "admin") {
        return null;
    }

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className={`fixed left-0 top-0 h-full w-64 border-r ${
            isDarkMode ? 'border-border-dark bg-background-dark' : 'border-border bg-background'
        }`}>
            <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-center border-b px-4">
                    <Link to="/admin" className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${
                            isDarkMode ? 'text-text-dark' : 'text-text'
                        }`}>
                            Admin Panel
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                            isActive("/admin/dashboard")
                                ? isDarkMode
                                    ? "bg-primary-dark text-white"
                                    : "bg-primary text-white"
                                : isDarkMode
                                ? "text-text-dark hover:bg-secondary-dark"
                                : "text-text hover:bg-secondary"
                        }`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        Dashboard
                    </Link>

                    <Link
                        to="/admin/analytics"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                            isActive("/admin/analytics")
                                ? isDarkMode
                                    ? "bg-primary-dark text-white"
                                    : "bg-primary text-white"
                                : isDarkMode
                                ? "text-text-dark hover:bg-secondary-dark"
                                : "text-text hover:bg-secondary"
                        }`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        Analytics
                    </Link>

                    <Link
                        to="/admin/event-posts"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                            isActive("/admin/event-posts")
                                ? isDarkMode
                                    ? "bg-primary-dark text-white"
                                    : "bg-primary text-white"
                                : isDarkMode
                                ? "text-text-dark hover:bg-secondary-dark"
                                : "text-text hover:bg-secondary"
                        }`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        Posts
                    </Link>

                    {/* <Link
                        to="/admin/users"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                            isActive("/admin/users")
                                ? isDarkMode
                                    ? "bg-primary-dark text-white"
                                    : "bg-primary text-white"
                                : isDarkMode
                                ? "text-text-dark hover:bg-secondary-dark"
                                : "text-text hover:bg-secondary"
                        }`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        Users
                    </Link> */}

                    <Link
                        to="/admin/events"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                            isActive("/admin/events")
                                ? isDarkMode
                                    ? "bg-primary-dark text-white"
                                    : "bg-primary text-white"
                                : isDarkMode
                                ? "text-text-dark hover:bg-secondary-dark"
                                : "text-text hover:bg-secondary"
                        }`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        Events
                    </Link>

                    {/* <Link
                        to="/admin/jobs"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                            isActive("/admin/jobs")
                                ? isDarkMode
                                    ? "bg-primary-dark text-white"
                                    : "bg-primary text-white"
                                : isDarkMode
                                ? "text-text-dark hover:bg-secondary-dark"
                                : "text-text hover:bg-secondary"
                        }`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        Jobs
                    </Link> */}
                </nav>
            </div>
        </div>
    );
};

export default AdminSidebar;