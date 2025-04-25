import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Get current user data using React Query
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (err) {
        return null;
      }
    },
  });

  const { data: eventsData, isLoading, error, refetch } = useQuery({
    queryKey: ["events", { selectedCategory, searchQuery }],
    queryFn: async () => {
      // Apply category filter on the server if it's not "all"
      const params = {};
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await axiosInstance.get("/events", { params });
      return response.data.events;
    },
  });

  const categories = [
    { id: "all", name: "All" },
    { id: "Networking", name: "Networking" },
    { id: "Mentorship", name: "Mentorship" },
    { id: "Workshops", name: "Workshops" },
    { id: "Social", name: "Social" },
    { id: "Alumni Meetups", name: "Alumni" },
    { id: "Webinars", name: "Webinars" },
    { id: "Others", name: "Others" },
  ];

  const filteredEvents = eventsData?.docs?.filter((event) => {
    const matchesSearch = searchQuery 
      ? event.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategory === "all" || 
                         event.category === selectedCategory ||
                         event.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Format time properly
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background dark:bg-background-dark">
        <div className="container mx-auto flex flex-1 flex-col px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="flex flex-col gap-3 pb-3">
                  <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl bg-secondary dark:bg-secondary-dark animate-pulse" />
                  <div className="w-3/4 h-4 bg-secondary dark:bg-secondary-dark rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background dark:bg-background-dark">
        <div className="container mx-auto flex flex-1 flex-col px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col w-full max-w-6xl mx-auto">
            <div className="text-center py-8">
              <p className="text-error dark:text-error-dark mb-4">Error loading events. Please try again.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background dark:bg-background-dark">
      <div className="container mx-auto flex flex-1 flex-col px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col w-full max-w-6xl mx-auto">
          {/* Category Filters - Horizontal Scroll on Mobile */}
          <div className="sticky top-0 z-10 bg-background dark:bg-background-dark pt-2 pb-3">
            <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex h-8 shrink-0 items-center justify-center rounded-full px-3 md:px-4 transition-colors text-sm ${
                    selectedCategory === category.id
                      ? "bg-primary text-white"
                      : "bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="px-1">
              <label className="flex flex-col w-full">
                <div className="relative flex w-full items-center">
                  <div className="absolute left-3 text-accent dark:text-accent-dark">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark placeholder:text-accent dark:placeholder:text-accent-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* No Events Found State */}
          {filteredEvents?.length === 0 && (
            <div className="flex flex-col items-center py-8 md:py-12">
              <div className="max-w-md w-full">
                <div
                  className="bg-center bg-no-repeat aspect-video bg-cover rounded-xl w-full"
                  style={{
                    backgroundImage: `url("https://cdn.usegalileo.ai/sdxl10/f60efd8c-c411-4556-baea-bfbc4629008d.png")`,
                  }}
                />
                <div className="flex flex-col items-center gap-2 mt-6 text-center">
                  <h3 className="text-xl font-bold text-text dark:text-text-dark">
                    No events found
                  </h3>
                  <p className="text-sm text-text-muted dark:text-text-dark-muted">
                    Try a different search term or check back later
                  </p>
                </div>
                {(authUser?.role === "admin" || authUser?.role === "alumni") && (
                  <div className="mt-6 flex justify-center">
                    <Link
                      to="/events/create"
                      className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors text-sm font-medium"
                    >
                      Create event
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manage Your Events Section (only for admin/alumni)
          {filteredEvents?.length > 0 && (authUser?.role === "admin" || authUser?.role === "alumni") && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text dark:text-text-dark mb-3">
                Manage Your Events
              </h2>
              <div className="bg-card dark:bg-card-dark rounded-xl p-4 border border-border dark:border-border-dark">
                <p className="text-text dark:text-text-dark mb-4">
                  As an {authUser.role}, you can manage events, track registrations, and create new events.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/my-events"
                    className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors text-sm font-medium"
                  >
                    View My Events
                  </Link>
                  <Link
                    to="/events/create"
                    className="px-4 py-2 bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark rounded-full hover:bg-secondary-dark dark:hover:bg-secondary transition-colors text-sm font-medium"
                  >
                    Create New Event
                  </Link>
                </div>
              </div>
            </div>
          )} */}

          {/* Upcoming Events */}
          {filteredEvents?.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-bold text-text dark:text-text-dark mb-4">
                Upcoming events
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredEvents.map((event) => (
                  <Link
                    key={event._id}
                    to={`/events/${event._id}`}
                    className="group flex flex-col bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark overflow-hidden hover:shadow-md transition-all duration-200 h-full"
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <div
                        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                        style={{
                          backgroundImage: `url(${event.bannerImg || "/placeholder-event.jpg"})`,
                        }}
                      />
                    </div>
                    <div className="flex flex-col p-4 gap-2 flex-1">
                      <h3 className="text-base font-medium text-text dark:text-text-dark line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-text-muted dark:text-text-dark-muted line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-auto pt-2">
                        <p className="text-sm text-text-muted dark:text-text-dark-muted">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <span className="text-text-muted dark:text-text-dark-muted">•</span>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted">
                          {formatTime(event.time)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;