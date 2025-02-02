import React from 'react';

import AdminSidebar from '../../components/admin/AdminSidebar.jsx'; 


const AdminPage = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        
      </div>
    </div>
  );
};

export default AdminPage;