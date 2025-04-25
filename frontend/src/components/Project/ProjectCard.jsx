import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, Trash2 } from 'lucide-react';

const ProjectCard = ({ project, onDelete }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Planning':
                return 'bg-yellow-100 text-yellow-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const calculateProgress = () => {
        if (!project.tasks?.length) return 0;
        const completedTasks = project.tasks.filter(task => task.status === 'Completed').length;
        return Math.round((completedTasks / project.tasks.length) * 100);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                    </div>
                    <button
                        onClick={onDelete}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{calculateProgress()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${calculateProgress()}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                            {project.teamMembers?.length || 0} members
                        </span>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                            {new Date(project.startDate).toLocaleDateString()} - 
                            {new Date(project.endDate).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Tasks */}
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                            {project.tasks?.length || 0} tasks
                        </span>
                    </div>
                </div>

                {/* View Project Button */}
                <Link
                    to={`/projects/${project._id}`}
                    className="mt-4 block w-full text-center bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    View Project
                </Link>
            </div>
        </div>
    );
};

export default ProjectCard; 