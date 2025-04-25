import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { axiosInstance } from "../../lib/axios";
import { useTheme } from "../../context/ThemeContext";
import { Search, Check, X, Trash2 } from "lucide-react";

const AdminPostsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();

    const { data: postsData, isLoading } = useQuery({
        queryKey: ["adminPosts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/posts");
            return response.data;
        },
    });

    const deletePostMutation = useMutation({
        mutationFn: async (postId) => {
            await axiosInstance.delete(`/admin/posts/${postId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["adminPosts"]);
            toast.success("Post deleted successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete post");
        },
    });

    const updatePostStatusMutation = useMutation({
        mutationFn: async ({ postId, status }) => {
            await axiosInstance.put(`/admin/posts/${postId}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["adminPosts"]);
            toast.success("Post status updated successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update post status");
        },
    });

    const filteredPosts = postsData?.posts?.filter((post) => {
        const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDeletePost = (postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            deletePostMutation.mutate(postId);
        }
    };

    const handleUpdateStatus = (postId, status) => {
        updatePostStatusMutation.mutate({ postId, status });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-background dark:bg-background-dark">
                <AdminSidebar />
                <div className="ml-64 flex-1 p-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-secondary dark:bg-secondary-dark rounded w-1/4 mb-4"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-24 bg-secondary dark:bg-secondary-dark rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-background-dark' : 'bg-background'}`}>
            <div className="flex flex-col lg:flex-row">
                <AdminSidebar />
                <div className="lg:ml-64 flex-1 p-4 lg:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
                        <h1 className={`text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                            Post Management
                        </h1>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'} w-full sm:w-auto`}>
                                <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`bg-transparent outline-none w-full ${isDarkMode ? 'text-text-dark placeholder-gray-400' : 'text-text placeholder-gray-500'}`}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={`px-3 py-2 rounded-lg w-full sm:w-auto ${isDarkMode ? 'bg-card-dark text-text-dark' : 'bg-card text-text'}`}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Posts Table */}
                    {isLoading ? (
                        <div className="animate-pulse">
                            <div className={`h-64 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'}`} />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                                        <th className={`py-3 px-2 lg:px-4 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Post</th>
                                        <th className={`py-3 px-2 lg:px-4 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Author</th>
                                        <th className={`py-3 px-2 lg:px-4 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created</th>
                                        <th className={`py-3 px-2 lg:px-4 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPosts?.map((post) => (
                                        <tr key={post._id} className={`border-b ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                                            <td className="py-4 px-2 lg:px-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className={`font-medium ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                                        {post.content.substring(0, 50)}...
                                                    </p>
                                                    {post.image && (
                                                        <img
                                                            src={post.image}
                                                            alt="Post"
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 lg:px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={post.author?.profilePicture || "/default-avatar.png"}
                                                        alt={post.author?.name || "Unknown User"}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-card dark:border-card-dark shadow-sm"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-text dark:text-text-dark">
                                                            {post.author?.name || "Unknown User"}
                                                        </div>
                                                        <div className="text-sm text-text-muted dark:text-text-dark-muted">
                                                            {post.author?.role || "No role"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`py-4 px-2 lg:px-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                            </td>
                                            <td className="py-4 px-2 lg:px-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDeletePost(post._id)}
                                                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-card-dark text-gray-400 hover:bg-card-dark' : 'bg-card text-gray-500 hover:bg-card'}`}
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
            </div>
        </div>
    );
};

export default AdminPostsPage; 