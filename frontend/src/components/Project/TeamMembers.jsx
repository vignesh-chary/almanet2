import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Plus, X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamMembers = ({ projectId }) => {
    const queryClient = useQueryClient();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    // Fetch project details
    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/projects/${projectId}`);
            return res.data;
        }
    });

    // Remove team member mutation
    const removeMemberMutation = useMutation({
        mutationFn: async (userId) => {
            await axiosInstance.delete(`/projects/${projectId}/team/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', projectId]);
            toast.success('Team member removed successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to remove team member');
        }
    });

    // Invite team member mutation
    const inviteMemberMutation = useMutation({
        mutationFn: async (email) => {
            await axiosInstance.post(`/projects/${projectId}/team/invite`, { email });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', projectId]);
            toast.success('Invitation sent successfully');
            setIsInviteModalOpen(false);
            setInviteEmail('');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        }
    });

    const handleInviteSubmit = (e) => {
        e.preventDefault();
        inviteMemberMutation.mutate(inviteEmail);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Team Members</h2>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <UserPlus className="w-5 h-5" />
                    Invite Member
                </button>
            </div>

            {/* Team Members List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project?.teamMembers?.map(member => (
                    <div
                        key={member.user._id}
                        className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={member.user.profilePicture || '/default-avatar.png'}
                                alt={member.user.name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <h3 className="font-medium">{member.user.name}</h3>
                                <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                        </div>
                        {member.user._id !== project.owner._id && (
                            <button
                                onClick={() => removeMemberMutation.mutate(member.user._id)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsInviteModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold mb-6">Invite Team Member</h2>

                        <form onSubmit={handleInviteSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteMemberMutation.isPending}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {inviteMemberMutation.isPending ? 'Sending...' : 'Send Invitation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamMembers; 