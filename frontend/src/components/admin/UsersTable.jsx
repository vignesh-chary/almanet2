import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import UserDetailsModal from "./UserDetailsModal";

const UsersTable = () => {
    const { isDarkMode } = useTheme();
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: users, isLoading } = useQuery({
        queryKey: ["adminUsers"],
        queryFn: () => axiosInstance.get("/admin/users").then((res) => res.data),
    });

    const { mutate: deleteUser } = useMutation({
        mutationFn: (userId) => axiosInstance.delete(`/admin/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminUsers"]);
            toast.success("User deleted successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete user");
        },
    });

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDelete = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            deleteUser(userId);
        }
    };

    if (isLoading) {
        return (
            <div className={`p-4 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                Loading users...
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                        <th className={`p-4 text-left ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>User</th>
                        <th className={`p-4 text-left ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Email</th>
                        <th className={`p-4 text-left ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Role</th>
                        <th className={`p-4 text-left ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map((user) => (
                        <tr key={user._id} className={`border-b ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user.profilePicture || "/avatar.png"}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className={`font-medium ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                            {user.name}
                                        </p>
                                        <p className={`text-sm ${isDarkMode ? 'text-text-dark/70' : 'text-text/70'}`}>
                                            @{user.username}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className={`p-4 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                {user.email}
                            </td>
                            <td className={`p-4 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    user.role === "admin"
                                        ? "bg-purple-100 text-purple-800"
                                        : user.role === "alumni"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                }`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isEditModalOpen && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                />
            )}
        </div>
    );
};

export default UsersTable; 