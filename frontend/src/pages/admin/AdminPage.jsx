import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Users, Calendar, BarChart2, TrendingUp, Activity, Search, Filter, Trash2, Edit2 } from "lucide-react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import UserDetailsModal from "../../components/admin/UserDetailsModal";

const AdminPage = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch user data using Tanstack Query
    const { data: userData } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            const response = await axiosInstance.get("/auth/me");
            return response.data;
        },
    });

    // If user is not admin, redirect to home
    if (userData?.role !== "admin") {
        navigate("/");
        return null;
    }

    // Fetch admin stats
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["adminStats"],
        queryFn: () => axiosInstance.get("/admin/stats"),
    });

    // Fetch users with filters
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ["adminUsers", searchQuery, roleFilter, sortBy, sortOrder],
        queryFn: () => 
            axiosInstance.get("/admin/users", {
                params: {
                    search: searchQuery,
                    role: roleFilter,
                    sortBy,
                    sortOrder
                }
            }),
    });

    // Update user role mutation
    const { mutate: updateUserRole } = useMutation({
        mutationFn: ({ userId, role }) => 
            axiosInstance.put(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminUsers"]);
            toast.success("User role updated successfully");
        },
        onError: () => {
            toast.error("Failed to update user role");
        }
    });

    // Delete user mutation
    const { mutate: deleteUser } = useMutation({
        mutationFn: (userId) => 
            axiosInstance.delete(`/admin/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminUsers"]);
            toast.success("User deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete user");
        }
    });

    // Update user details mutation
    const { mutate: updateUserDetails, isLoading: isUpdating } = useMutation({
        mutationFn: async ({ userId, data }) => {
            try {
                const response = await axiosInstance.put(`/admin/users/${userId}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            } catch (error) {
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["adminUsers"]);
            toast.success("User details updated successfully");
            setIsEditModalOpen(false);
        },
        onError: (error) => {
            console.error("Error updating user:", error);
            toast.error(error.response?.data?.message || "Failed to update user details");
        }
    });

    const handleRoleChange = (userId, newRole) => {
        updateUserRole({ userId, role: newRole });
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            deleteUser(userId);
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const renderStatCard = (title, value, Icon, trend) => (
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'} shadow-sm border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'}`}>
                    <Icon className={`w-6 h-6 ${isDarkMode ? 'text-text-dark' : 'text-text'}`} />
                </div>
                <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                </span>
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>{value}</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        </div>
    );

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-background-dark' : 'bg-background'}`}>
            <div className="flex flex-col lg:flex-row">
                <AdminSidebar />
                <div className="lg:ml-64 flex-1 p-4 lg:p-8">
                    <h1 className={`text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                        Admin Dashboard
                    </h1>

                    {/* Stats Grid */}
                    {statsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className={`h-24 lg:h-32 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'}`} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                            {renderStatCard(
                                "Total Users",
                                stats?.data.stats.users.total,
                                Users,
                                stats?.data.stats.users.growth
                            )}
                            {renderStatCard(
                                "Active Events",
                                stats?.data.stats.events.total,
                                Calendar,
                                stats?.data.stats.events.growth
                            )}
                            {renderStatCard(
                                "User Growth",
                                `${stats?.data.stats.users.active} active`,
                                TrendingUp,
                                stats?.data.stats.users.growth
                            )}
                            {renderStatCard(
                                "Platform Activity",
                                `${stats?.data.stats.platform.activity.toFixed(1)}%`,
                                Activity,
                                stats?.data.stats.platform.activity
                            )}
                        </div>
                    )}

                    {/* User Management Section */}
                    <div className={`rounded-lg shadow-sm border ${isDarkMode ? 'bg-card-dark border-border-dark' : 'bg-card border-border'} p-4 lg:p-6`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                User Management
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'} w-full sm:w-auto`}>
                                    <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`bg-transparent outline-none w-full ${isDarkMode ? 'text-text-dark placeholder-gray-400' : 'text-text placeholder-gray-500'}`}
                                    />
                                </div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className={`px-3 py-2 rounded-lg w-full sm:w-auto ${isDarkMode ? 'bg-card-dark text-text-dark' : 'bg-card text-text'}`}
                                >
                                    <option value="">All Roles</option>
                                    <option value="student">Students</option>
                                    <option value="alumni">Alumni</option>
                                    <option value="admin">Admins</option>
                                </select>
                            </div>
                        </div>

                        {/* Users Table */}
                        {usersLoading ? (
                            <div className="animate-pulse">
                                <div className={`h-64 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'}`} />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`border-b ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                                            <th className={`py-3 px-2 lg:px-4 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>User</th>
                                            <th className={`py-3 px-2 lg:px-4 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</th>
                                            <th className={`py-3 px-2 lg:px-4 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined</th>
                                            <th className={`py-3 px-2 lg:px-4 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersData?.data.users.map((user) => (
                                            <tr key={user._id} className={`border-b ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                                                <td className="py-4 px-2 lg:px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.profilePicture || "/avatar.png"}
                                                            alt={user.name}
                                                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
                                                        />
                                                        <div>
                                                            <p className={`font-medium ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                                                {user.name}
                                                            </p>
                                                            <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 lg:px-4">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        className={`px-2 py-1 rounded text-sm ${isDarkMode ? 'bg-card-dark text-text-dark' : 'bg-card text-text'}`}
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="alumni">Alumni</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className={`py-4 px-2 lg:px-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                                </td>
                                                <td className="py-4 px-2 lg:px-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className={`p-2 rounded-lg ${isDarkMode ? 'bg-card-dark text-gray-400 hover:bg-card-dark' : 'bg-card text-gray-500 hover:bg-card'}`}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {isEditModalOpen && (
                        <UserDetailsModal
                            user={selectedUser}
                            onClose={() => {
                                setIsEditModalOpen(false);
                                setSelectedUser(null);
                            }}
                            onSave={updateUserDetails}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;