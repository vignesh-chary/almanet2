import React from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminPage = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 ml-16">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Welcome to the Admin Dashboard. Use the sidebar to navigate.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;