import React from 'react';
import { Users, CheckCircle, Calendar, PowerOff } from 'lucide-react';
import EmployeeTable from '../../components/employee/EmployeeTable';
import { Search } from 'lucide-react';
import { Card, StatCard, StatusBadge, Button } from '../../components/ui';
import { useState } from 'react';

interface EmployeeStat {
  label: string;
  value: string | number;
  variant?: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const employeeStats: EmployeeStat[] = [
  { label: 'Total Employees', value: 124, variant: 'primary', icon: Users },
  { label: 'Active', value: 96, variant: 'success', icon: CheckCircle },
  { label: 'On Leave', value: 21, variant: 'info', icon: Calendar },
  { label: 'Offline', value: 7, variant: 'critical', icon: PowerOff }
];

const EmployeesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStats = employeeStats.filter(stat =>
    String(stat.value).includes(searchTerm) || stat.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage employee records and tracking
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="input w-64 placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {filteredStats.map((stat, index) => (
          <Card key={index} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              {stat.icon ? (
                <stat.icon className="h-5 w-5" />
              ) : (
                <div className="h-5 w-5" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <StatusBadge status={stat.variant || 'info'} size="sm" />
          </Card>
        ))}
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <EmployeeTable />
      </div>
    </div>
  );
};

export default EmployeesPage;