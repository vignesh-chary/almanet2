import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom";
import MenteeCard from "../../components/mentorship/MenteeCard.jsx";
import { Users, Clock, Target, Loader2, AlertTriangle, Search, Plus, UserPlus, Calendar, BarChart2 } from "lucide-react";
import { format } from "date-fns";

const MentorshipDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["mentorDashboardStats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/mentorships/dashboard-stats");
      return data;
    },
  });

  // Fetch mentees data
  const { data: mentees = [], isLoading: isLoadingMentees, error, refetch } = useQuery({
    queryKey: ["mentees"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/mentorships/mentees");
        return response.data;
      } catch (err) {
        console.error("Error fetching mentees:", err);
        throw err;
      }
    },
  });

  // Filter and sort mentees
  const filteredMentees = React.useMemo(() => {
    if (!mentees) return [];

    return mentees
      .filter(mentee => {
        const menteeData = mentee.mentee || mentee.user || mentee;
        const matchesSearch = debouncedSearch 
          ? (menteeData.name || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (menteeData.email || "").toLowerCase().includes(debouncedSearch.toLowerCase())
          : true;
        
        const matchesStatus = statusFilter === "all" || mentee.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aData = a.mentee || a.user || a;
        const bData = b.mentee || b.user || b;
        
        if (sortBy === "recent") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } else if (sortBy === "name") {
          return (aData.name || "").localeCompare(bData.name || "");
        }
        return 0;
      });
  }, [mentees, debouncedSearch, statusFilter, sortBy]);

  // Dashboard statistics
  const dashboardStats = [
    {
      label: "Total Mentees",
      value: stats?.totalMentees || 0,
      icon: Users,
      color: "primary",
      description: "Active and completed mentorships",
    },
    {
      label: "Active Goals",
      value: stats?.activeGoals || 0,
      icon: Target,
      color: "success",
      description: "Goals in progress",
    },
    {
      label: "Upcoming Sessions",
      value: stats?.upcomingSessions || 0,
      icon: Calendar,
      color: "accent",
      description: "Scheduled meetings",
    },
    {
      label: "Goal Completion",
      value: `${stats?.completionRate || 0}%`,
      icon: BarChart2,
      color: "info",
      description: `${stats?.completedGoals || 0} of ${stats?.totalGoals || 0} goals`,
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text dark:text-text-dark">
              Mentor Dashboard
            </h1>
            <p className="text-text-muted dark:text-text-dark-muted mt-2">
              Manage your mentees and track their progress
            </p>
          </div>
          
        </div>

        {/* Statistics Summary - Non-clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              className="bg-card dark:bg-card-dark rounded-xl shadow-sm border border-border dark:border-border-dark p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-2 bg-${stat.color}/10 dark:bg-${stat.color}-dark/20 rounded-lg`}>
                  <stat.icon size={24} className={`text-${stat.color} dark:text-${stat.color}-dark`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-text dark:text-text-dark">{stat.value}</h3>
              <p className="text-sm font-medium text-text dark:text-text-dark mt-1">{stat.label}</p>
              <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Current Mentees Section */}
        <div className="bg-card dark:bg-card-dark rounded-xl shadow-sm border border-border dark:border-border-dark p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text dark:text-text-dark">
              Current Mentees ({filteredMentees?.length || 0})
            </h2>
            
            {/* Commented out search and filters */}
            {/* <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search mentees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-accent dark:focus:border-accent-dark focus:ring-2 focus:ring-accent/30 dark:focus:ring-accent-dark/30 transition-all"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-text-dark-muted" />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-sm text-text dark:text-text-dark focus:border-accent dark:focus:border-accent-dark focus:ring-2 focus:ring-accent/30 dark:focus:ring-accent-dark/30 transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-sm text-text dark:text-text-dark focus:border-accent dark:focus:border-accent-dark focus:ring-2 focus:ring-accent/30 dark:focus:ring-accent-dark/30 transition-all"
                >
                  <option value="recent">Sort by Recent</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div> */}
          </div>

          {/* Loading State */}
          {(isLoadingMentees || isLoadingStats) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-secondary dark:bg-secondary-dark/30 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-background dark:bg-background-dark rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-background dark:bg-background-dark rounded w-3/4"></div>
                      <div className="h-3 bg-background dark:bg-background-dark rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-background dark:bg-background-dark rounded-full mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-background dark:bg-background-dark rounded-lg w-24"></div>
                    <div className="h-8 bg-background dark:bg-background-dark rounded-lg w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-error dark:text-error-dark">
                <AlertTriangle size={40} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                Error Loading Mentees
              </h3>
              <p className="text-text-muted dark:text-text-dark-muted mb-4">
                {error.message || "Please try again later"}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark rounded-lg hover:bg-primary/20 dark:hover:bg-primary-dark/30 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Mentees Grid */}
          {!isLoadingMentees && !isLoadingStats && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMentees && filteredMentees.length > 0 ? (
                filteredMentees.map((mentee) => (
                  <MenteeCard 
                    key={mentee._id} 
                    mentee={mentee} 
                    onStatusChange={() => refetch()} 
                  />
                ))
              ) : (
                <div className="col-span-2 min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                  <Users size={48} className="text-text-muted dark:text-text-dark-muted mb-4" />
                  <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
                    No mentees found
                  </h3>
                  <p className="text-text-muted dark:text-text-dark-muted mb-6 max-w-md">
                    Start your mentoring journey by connecting with new mentees
                  </p>
                  <Link
                    to="/find-mentees"
                    className="flex items-center gap-2 px-6 py-3 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary transition-colors shadow-sm"
                  >
                    <UserPlus size={20} />
                    <span>Find Mentees</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorshipDashboard;