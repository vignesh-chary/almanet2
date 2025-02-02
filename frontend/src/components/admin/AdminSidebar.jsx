import React from "react";
import { Link } from "react-router-dom";

const AdminSidebar = ({ isOpen }) => {
  return (
    <div className={`fixed top-0 left-0 h-full ${isOpen ? "w-64" : "w-16"} bg-gray-800 text-white transition-all`}>
      <div className="flex flex-col items-center py-4">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <nav className="mt-8 space-y-4">
          <Link to="/admin/events" className="block px-4 py-2 hover:bg-gray-700 rounded">
            Events
          </Link>
          <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-700 rounded">
            Users
          </Link>
          <Link to="/admin/stats" className="block px-4 py-2 hover:bg-gray-700 rounded">
            Statistics
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
