import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Plus, MoreVertical, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateTask from './CreateTask';

const TaskBoard = ({ projectId }) => {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [draggedTask, setDraggedTask] = useState(null);

    // Fetch project tasks
    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/projects/${projectId}`);
            return res.data;
        }
    });

    // Update task status mutation
    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, status }) => {
            await axiosInstance.put(`/projects/${projectId}/tasks/${taskId}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', projectId]);
            toast.success('Task updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update task');
        }
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId) => {
            await axiosInstance.delete(`/projects/${projectId}/tasks/${taskId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', projectId]);
            toast.success('Task deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete task');
        }
    });

    const handleDragStart = (task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, status) => {
        e.preventDefault();
        if (draggedTask && draggedTask.status !== status) {
            updateTaskMutation.mutate({ taskId: draggedTask._id, status });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'text-red-500';
            case 'Medium':
                return 'text-yellow-500';
            case 'Low':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const columns = [
        { id: 'Pending', title: 'To Do' },
        { id: 'In Progress', title: 'In Progress' },
        { id: 'Completed', title: 'Done' }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tasks</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <Plus className="w-5 h-5" />
                    Add Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(column => (
                    <div
                        key={column.id}
                        className="bg-gray-50 rounded-lg p-4"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <h3 className="font-semibold mb-4">{column.title}</h3>
                        <div className="space-y-4">
                            {project?.tasks
                                ?.filter(task => task.status === column.id)
                                .map(task => (
                                    <div
                                        key={task._id}
                                        draggable
                                        onDragStart={() => handleDragStart(task)}
                                        className="bg-white p-4 rounded-lg shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium">{task.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                <button
                                                    onClick={() => deleteTaskMutation.mutate(task._id)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                {task.assignedTo && (
                                                    <img
                                                        src={task.assignedTo.profileImg || '/default-avatar.png'}
                                                        alt={task.assignedTo.name}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                )}
                                                {task.deadline && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>
                                                            {new Date(task.deadline).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Task Modal */}
            {isCreateModalOpen && (
                <CreateTask
                    projectId={projectId}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
    );
};

export default TaskBoard; 