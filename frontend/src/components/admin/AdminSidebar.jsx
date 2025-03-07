import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, BarChart2, Menu, ChevronRight } from "lucide-react";

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full ${
        isExpanded ? "w-64" : "w-20"
      } bg-indigo-900 text-white transition-all duration-300 flex flex-col shadow-lg`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-indigo-800/50">
        <h2 
          className={`text-lg font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent transition-opacity duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          Admin Panel
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-200 hover:text-white transition-colors"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu size={24} />
        </button>
      </div>

      <nav className="mt-6 flex flex-col gap-2 px-2">
        <SidebarLink 
          to="/admin/events"
          icon={<Calendar size={20} />}
          label="Events"
          isActive={isActive("/admin/events")}
          isExpanded={isExpanded}
        />
        
        {/* Uncomment these when needed */}
        {/* 
        <SidebarLink 
          to="/admin/users"
          icon={<Users size={20} />}
          label="Users"
          isActive={isActive("/admin/users")}
          isExpanded={isExpanded}
        />
        
        <SidebarLink 
          to="/admin/stats"
          icon={<BarChart2 size={20} />}
          label="Statistics"
          isActive={isActive("/admin/stats")}
          isExpanded={isExpanded}
        />
        */}
      </nav>
      
      <div className="mt-auto mb-6 px-2">
        {isExpanded && (
          <div className="text-xs text-indigo-300 px-4 pb-2">
            © 2025 Almanet
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted SidebarLink component for better organization
const SidebarLink = ({ to, icon, label, isActive, isExpanded }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group ${
        isActive 
          ? "bg-indigo-700 text-white" 
          : "text-indigo-200 hover:bg-indigo-800/60 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3 relative">
        <span className={`${isActive ? "text-white" : "text-indigo-300 group-hover:text-white"} transition-colors`}>
          {icon}
        </span>
        
        {isExpanded && (
          <span className="font-medium">{label}</span>
        )}
        
        {isActive && (
          <span className="absolute left-0 -ml-4 top-1/2 transform -translate-y-1/2 h-8 w-1 bg-indigo-400 rounded-r-full" />
        )}
      </div>
      
      {isActive && !isExpanded && (
        <span className="absolute right-0 mr-2 text-indigo-300">
          <ChevronRight size={16} />
        </span>
      )}
    </Link>
  );
};

export default AdminSidebar;