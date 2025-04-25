import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Plus, Users, Calendar, Clock, MessageSquare, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskBoard from './TaskBoard';
import TeamMembers from './TeamMembers';
import ProjectFiles from './ProjectFiles';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('tasks');

    // Fetch project details
    const { data: project, isLoading, isError, error } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get(`/projects/${id}`);
                return res.data;
            } catch (err) {
                console.error('Error fetching project:', err);
                throw err;
            }
        },
        enabled: !!id // Only run query when id is defined
    });

    // Delete project mutation
    const deleteMutation = useMutation({
        mutationFn: async () => {
            await axiosInstance.delete(`/projects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
            toast.success('Project deleted successfully');
            navigate('/projects');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete project');
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Project</h2>
                <p className="text-red-500 mb-4">{error?.response?.data?.message || error?.message || 'Failed to load project'}</p>
                <button
                    onClick={() => navigate('/projects')}
                    className="mt-4 text-primary hover:text-primary/80"
                >
                    Back to Projects
                </button>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-gray-800">Project not found</h2>
                <button
                    onClick={() => navigate('/projects')}
                    className="mt-4 text-primary hover:text-primary/80"
                >
                    Back to Projects
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                        <p className="text-gray-600">{project.description}</p>
                    </div>
                    <button
                        onClick={() => deleteMutation.mutate()}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-5 h-5" />
                        <span>{project.teamMembers?.length || 0} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <span>
                            {new Date(project.startDate).toLocaleDateString()} -
                            {new Date(project.endDate).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span>{project.tasks?.length || 0} tasks</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-4 py-2 rounded-lg ${activeTab === 'tasks'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Tasks
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-2 rounded-lg ${activeTab === 'team'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Team
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={`px-4 py-2 rounded-lg ${activeTab === 'files'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Files
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
                {activeTab === 'tasks' && <TaskBoard projectId={id} />}
                {activeTab === 'team' && <TeamMembers projectId={id} />}
                {activeTab === 'files' && <ProjectFiles projectId={id} />}
            </div>
        </div>
    );
};

export default ProjectDetails; 