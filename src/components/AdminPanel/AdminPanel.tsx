import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import BlogAdminTable from './elements/BlogAdminTable';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        
      </div>

      <BlogAdminTable />
    </div>
  );
};

export default AdminPanel;