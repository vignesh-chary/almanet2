import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { 
    Users, Calendar, TrendingUp, MessageSquare, 
    Users2, Target, BarChart2, LineChart, PieChart,
    Activity, BookOpen, Handshake, Mail, Clock,
    Filter, Calendar as CalendarIcon, Goal, Briefcase,
    CheckCircle, XCircle, Clock as ClockIcon
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
    LineChart as RechartsLineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

const AnalyticsPage = () => {
    const { isDarkMode } = useTheme();
    const [timeRange, setTimeRange] = useState('week');
    const [selectedRole, setSelectedRole] = useState('all');

    // Fetch analytics data
    const { data: analytics, isLoading } = useQuery({
        queryKey: ["adminAnalytics", timeRange, selectedRole],
        queryFn: () => axiosInstance.get("/admin/analytics", {
            params: { timeRange, role: selectedRole }
        }),
    });

    const renderStatCard = (title, value, Icon, trend, description) => {
        // Handle undefined values
        const displayValue = value ?? 0;
        const displayTrend = trend ?? 0;
        const displayDescription = description ?? '';

        return (
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'} shadow-sm border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'}`}>
                        <Icon className={`w-6 h-6 ${isDarkMode ? 'text-text-dark' : 'text-text'}`} />
                    </div>
                    <span className={`text-sm font-medium ${displayTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {displayTrend >= 0 ? '+' : ''}{displayTrend.toFixed(1)}%
                    </span>
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                    {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
                {displayDescription && (
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{displayDescription}</p>
                )}
            </div>
        );
    };

    const renderChart = (title, data, type = 'line') => {
        if (!data || data.length === 0) {
            return (
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'} shadow-sm border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>{title}</h3>
                    <div className="h-64 flex items-center justify-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No data available</p>
                    </div>
                </div>
            );
        }

        return (
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'} shadow-sm border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>{title}</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        {type === 'line' ? (
                            <RechartsLineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#22c55e" />
                            </RechartsLineChart>
                        ) : type === 'bar' ? (
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#22c55e" />
                            </BarChart>
                        ) : (
                            <RechartsPieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.name === 'accepted' ? '#22c55e' : entry.name === 'pending' ? '#f59e0b' : '#ef4444'} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </RechartsPieChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'bg-background-dark' : 'bg-background'}`}>
                <div className="flex">
                    <AdminSidebar />
                    <div className="ml-64 flex-1 p-8">
                        <div className="animate-pulse">
                            <div className={`h-8 w-48 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'} mb-8`} />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`h-32 rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'}`} />
                                ))}
                            </div>
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
                            Analytics Dashboard
                        </h1>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className={`px-3 py-2 rounded-lg w-full sm:w-auto ${isDarkMode ? 'bg-card-dark text-text-dark' : 'bg-card text-text'}`}
                            >
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                                <option value="quarter">Last Quarter</option>
                                <option value="year">Last Year</option>
                            </select>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className={`px-3 py-2 rounded-lg w-full sm:w-auto ${isDarkMode ? 'bg-card-dark text-text-dark' : 'bg-card text-text'}`}
                            >
                                <option value="all">All Users</option>
                                <option value="student">Students</option>
                                <option value="alumni">Alumni</option>
                            </select>
                        </div>
                    </div>

                    {/* Overall Platform Usage */}
                    <section className="mb-6 lg:mb-8">
                        <h2 className={`text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                            Overall Platform Usage
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {renderStatCard(
                                "Total Users",
                                analytics?.data?.stats?.users?.total,
                                Users,
                                analytics?.data?.stats?.users?.growth,
                                `${analytics?.data?.stats?.users?.students ?? 0} students, ${analytics?.data?.stats?.users?.alumni ?? 0} alumni`
                            )}
                            {renderStatCard(
                                "New Registrations",
                                analytics?.data?.stats?.users?.newRegistrations,
                                Users2,
                                analytics?.data?.stats?.users?.registrationGrowth,
                                "New users this period"
                            )}
                            {renderStatCard(
                                "Total Connections",
                                analytics?.data?.stats?.connections?.total,
                                Handshake,
                                analytics?.data?.stats?.connections?.growth,
                                `Average ${analytics?.data?.stats?.connections?.avgPerUser?.toFixed(1) ?? 0} per user`
                            )}
                        </div>
                    </section>

                    {/* Mentorship Metrics */}
                    <section className="mb-6 lg:mb-8">
                        <h2 className={`text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                            Mentorship Metrics
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {renderStatCard(
                                "Total Mentors",
                                analytics?.data?.stats?.mentorship?.totalMentors,
                                Users,
                                analytics?.data?.stats?.mentorship?.mentorGrowth,
                                `${analytics?.data?.stats?.mentorship?.activeMentors} active`
                            )}
                            {renderStatCard(
                                "Total Mentees",
                                analytics?.data?.stats?.mentorship?.totalMentees,
                                Users2,
                                analytics?.data?.stats?.mentorship?.menteeGrowth,
                                `${analytics?.data?.stats?.mentorship?.activeMentees} active`
                            )}
                            {renderStatCard(
                                "New Requests",
                                analytics?.data?.stats?.mentorship?.newRequests,
                                Mail,
                                analytics?.data?.stats?.mentorship?.requestGrowth,
                                "This period"
                            )}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 lg:gap-6 mt-4 lg:mt-6">
                            {renderChart("Mentorship Status Distribution", analytics?.data?.stats?.mentorship?.statusGraph, 'pie')}
                        </div>
                    </section>

                    {/* Goals and Meetings */}
                    <section className="mb-6 lg:mb-8">
                        <h2 className={`text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                            Goals and Meetings
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            {renderStatCard(
                                "Total Goals",
                                analytics?.data?.stats?.goals?.total,
                                Goal,
                                null,
                                `${analytics?.data?.stats?.goals?.completed} completed`
                            )}
                            {renderStatCard(
                                "Goal Completion",
                                `${analytics?.data?.stats?.goals?.completionRate?.toFixed(1) ?? 0}%`,
                                CheckCircle,
                                null,
                                `${analytics?.data?.stats?.goals?.incomplete} remaining`
                            )}
                            {renderStatCard(
                                "Total Meetings",
                                analytics?.data?.stats?.meetings?.total,
                                CalendarIcon,
                                null,
                                `${analytics?.data?.stats?.meetings?.upcoming} upcoming`
                            )}
                            {renderStatCard(
                                "Meeting Schedule",
                                analytics?.data?.stats?.meetings?.upcoming,
                                ClockIcon,
                                null,
                                "Scheduled meetings"
                            )}
                        </div>
                    </section>

                    {/* Content and Engagement */}
                    <section className="mb-6 lg:mb-8">
                        <h2 className={`text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                            Content and Engagement
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {renderStatCard(
                                "Total Posts",
                                analytics?.data?.stats?.posts?.total,
                                BookOpen,
                                null,
                                `${analytics?.data?.stats?.posts?.likes} likes, ${analytics?.data?.stats?.posts?.comments} comments`
                            )}
                            {renderStatCard(
                                "Total Jobs",
                                analytics?.data?.stats?.jobs?.total,
                                Briefcase,
                                null,
                                "Total job listings"
                            )}
                            {renderStatCard(
                                "Total Messages",
                                analytics?.data?.stats?.messages?.total,
                                MessageSquare,
                                null,
                                `${analytics?.data?.stats?.messages?.recent} recent`
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage; 