import React, { useEffect, useState } from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Shield, CalendarX, RefreshCw, Settings } from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

interface StatisticsProps {
  employeeData: Employee[];
}

const Statistics: React.FC<StatisticsProps> = ({ employeeData }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const { notify } = useToast();
  const navigate = useNavigate();

  // Calculate statistics
  const totalEmployees = employeeData?.length || 0;
  const activeEmployees = (employeeData?.filter((e) => e.status === 'Active') || []).length;
  const onLeaveEmployees = (employeeData?.filter((e) => e.status === 'On Leave') || []).length;
  const offlineEmployees = (employeeData?.filter((e) => e.status === 'Offline') || []).length;

  const handleRefresh = () => {
    notify({
      title: 'Data Refreshed',
      description: 'Employee statistics have been updated successfully',
      variant: 'success',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Employee Statistics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Overview of employee status and attendance
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">
                {selectedYear}-{String(selectedMonth).padStart(2, '0')}
              </span>
              <button
                onClick={() => navigate('/statistics', { replace: true })}
                className="ml-2 text-sm text-blue-600 hover underline"
              >
                View Full Report
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Employees Card */}
        <Card className="p-6 bg-white rounded-2xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Total Employees
              </p>
              <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
            <StatusBadge status="online" size="sm" />
          </div>
        </Card>

        {/* Active Employees Card */}
        <Card className="p-6 bg-white rounded-2xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Active Employees
              </p>
              <p className="text-3xl font-bold text-gray-900">{activeEmployees}</p>
            </div>
            <StatusBadge status="success" size="sm" />
          </div>
        </Card>

        {/* On Leave Card */}
        <Card className="p-6 bg-white rounded-2xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                On Leave
              </p>
              <p className="text-3xl font-bold text-gray-900">{onLeaveEmployees}</p>
            </div>
            <StatusBadge status="info" size="sm" />
          </div>
        </Card>

        {/* Offline Card */}
        <Card className="p-6 bg-white rounded-2xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Offline
              </p>
              <p className="text-3xl font-bold text-gray-900">{offlineEmployees}</p>
            </div>
            <StatusBadge status="critical" size="sm" />
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Button variant="primary" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
        <Button variant="secondary">
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
      </div>

      {/* Employee List Summary */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Status Breakdown</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <StatusBadge status="online" size="sm" />
            <span>Online: {activeEmployees}</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="info" size="sm" />
            <span>On Leave: {onLeaveEmployees}</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="critical" size="sm" />
            <span>Offline: {offlineEmployees}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Statistics;