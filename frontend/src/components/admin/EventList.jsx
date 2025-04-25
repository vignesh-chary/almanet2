import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Calendar, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import AdminSidebar from "../admin/AdminSidebar";
import { useTheme } from "../../context/ThemeContext";

const EventList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Fetch all events
  const { data: events, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: async () => {
      const response = await axiosInstance.get("/events", {
        params: {
          admin: true
        }
      });
      return response.data.events.docs || [];
    },
  });

  // Apply client-side filtering whenever statusFilter or events change
  useEffect(() => {
    if (events) {
      if (statusFilter === "all") {
        setFilteredEvents(events);
      } else {
        setFilteredEvents(events.filter(event => event.status === statusFilter));
      }
    }
  }, [statusFilter, events]);

  // Apply search filter
  useEffect(() => {
    if (events && searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      let filtered = events.filter(event => 
        event.title.toLowerCase().includes(lowerSearchQuery) ||
        event.description?.toLowerCase().includes(lowerSearchQuery)
      );
      
      if (statusFilter !== "all") {
        filtered = filtered.filter(event => event.status === statusFilter);
      }
      
      setFilteredEvents(filtered);
    } else if (events) {
      if (statusFilter === "all") {
        setFilteredEvents(events);
      } else {
        setFilteredEvents(events.filter(event => event.status === statusFilter));
      }
    }
  }, [searchQuery, events, statusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
          <Loader2 size={40} className="animate-spin text-primary relative" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-text-muted">
            <Calendar size={40} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">Failed to Load Events</h3>
          <p className="text-text-muted mb-4">Please try again later.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex size-full min-h-screen flex-col ${isDarkMode ? 'bg-background-dark' : 'bg-background'} group/design-root overflow-x-hidden`}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex">
          <AdminSidebar />
          <div className="ml-80 flex-1">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 mx-auto px-6 py-5">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className={`${isDarkMode ? 'text-text-dark' : 'text-text'} tracking-light text-[32px] font-bold leading-tight min-w-72`}>Events</p>
                <button
                  onClick={() => navigate("/events/create")}
                  className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 ${isDarkMode ? 'bg-secondary-dark text-text-dark' : 'bg-secondary text-text'} text-sm font-medium leading-normal`}
                >
                  <Plus size={16} className="mr-1" />
                  <span className="truncate">Create Event</span>
                </button>
              </div>

              {/* Search and Filters */}
              <div className="px-4 py-3">
                <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div className={`${isDarkMode ? 'text-accent-dark' : 'text-accent'} flex border-none ${isDarkMode ? 'bg-secondary-dark' : 'bg-secondary'} items-center justify-center pl-4 rounded-l-xl border-r-0`}>
                      <Search size={24} />
                    </div>
                    <input
                      placeholder="Search Events"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl ${isDarkMode ? 'text-text-dark' : 'text-text'} focus:outline-0 focus:ring-0 border-none ${isDarkMode ? 'bg-secondary-dark' : 'bg-secondary'} focus:border-none h-full ${isDarkMode ? 'placeholder:text-accent-dark' : 'placeholder:text-accent'} px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal`}
                    />
                  </div>
                </label>
              </div>

              <div className="flex gap-3 p-3 flex-wrap pr-4">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl px-4 ${statusFilter === "all" ? "bg-primary text-white" : isDarkMode ? "bg-secondary-dark text-text-dark" : "bg-secondary text-text"}`}
                >
                  <p className="text-sm font-medium leading-normal">All</p>
                </button>
                {/* Commented out published and cancelled filters
                <button
                  onClick={() => setStatusFilter("published")}
                  className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl px-4 ${statusFilter === "published" ? "bg-primary text-white" : isDarkMode ? "bg-secondary-dark text-text-dark" : "bg-secondary text-text"}`}
                >
                  <p className="text-sm font-medium leading-normal">Published</p>
                </button>
                <button
                  onClick={() => setStatusFilter("cancelled")}
                  className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl px-4 ${statusFilter === "cancelled" ? "bg-primary text-white" : isDarkMode ? "bg-secondary-dark text-text-dark" : "bg-secondary text-text"}`}
                >
                  <p className="text-sm font-medium leading-normal">Cancelled</p>
                </button>
                */}
              </div>

              {/* Events Table */}
              <div className="px-4 py-3 @container">
                <div className={`flex overflow-hidden rounded-xl border ${isDarkMode ? 'border-border-dark' : 'border-border'} ${isDarkMode ? 'bg-card-dark' : 'bg-card'}`}>
                  <table className="flex-1">
                    <thead>
                      <tr className={isDarkMode ? 'bg-card-dark' : 'bg-card'}>
                        <th className={`table-column-120 px-4 py-3 text-left ${isDarkMode ? 'text-text-dark' : 'text-text'} w-[400px] text-sm font-medium leading-normal`}>Event</th>
                        <th className={`table-column-240 px-4 py-3 text-left ${isDarkMode ? 'text-text-dark' : 'text-text'} w-[400px] text-sm font-medium leading-normal`}>Date</th>
                        <th className={`table-column-360 px-4 py-3 text-left ${isDarkMode ? 'text-text-dark' : 'text-text'} w-[400px] text-sm font-medium leading-normal`}>Location</th>
                        <th className={`table-column-480 px-4 py-3 text-left ${isDarkMode ? 'text-text-dark' : 'text-text'} w-[400px] text-sm font-medium leading-normal`}>Status</th>
                        <th className={`table-column-600 px-4 py-3 text-left ${isDarkMode ? 'text-text-dark' : 'text-text'} w-60 ${isDarkMode ? 'text-accent-dark' : 'text-accent'} text-sm font-medium leading-normal`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr key={event._id} className={`border-t ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                          <td className={`table-column-120 h-[72px] px-4 py-2 w-[400px] ${isDarkMode ? 'text-text-dark' : 'text-text'} text-sm font-normal leading-normal`}>
                            {event.title}
                          </td>
                          <td className={`table-column-240 h-[72px] px-4 py-2 w-[400px] ${isDarkMode ? 'text-accent-dark' : 'text-accent'} text-sm font-normal leading-normal`}>
                            {format(new Date(event.date), "MMM d, yyyy")}
                          </td>
                          <td className={`table-column-360 h-[72px] px-4 py-2 w-[400px] ${isDarkMode ? 'text-accent-dark' : 'text-accent'} text-sm font-normal leading-normal`}>
                            {event.locationType === 'online' ? 'Online' : event.physicalLocation}
                          </td>
                          <td className={`table-column-480 h-[72px] px-4 py-2 w-[400px] text-sm font-normal leading-normal`}>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              event.status === 'published' 
                                ? isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
                                : event.status === 'pending' 
                                ? isDarkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                                : isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'
                            }`}>
                              {event.status}
                            </span>
                          </td>
                          <td className={`table-column-600 h-[72px] px-4 py-2 w-60 ${isDarkMode ? 'text-accent-dark' : 'text-accent'} text-sm font-bold leading-normal tracking-[0.015em]`}>
                            <div className="flex gap-2">
                              <Link
                                to={`/my-events/${event._id}`}
                                className={`${isDarkMode ? 'hover:text-primary-dark' : 'hover:text-primary'} transition-colors`}
                              >
                                Manage
                              </Link>
                              <Link
                                to={`/my-events/${event._id}/edit`}
                                className={`${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'} transition-colors`}
                              >
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredEvents.length === 0 && (
                  <div className={`text-center py-6 ${isDarkMode ? 'text-accent-dark' : 'text-accent'}`}>
                    No events found matching your criteria
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventList;