import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Users, Shield, Folder, Settings, Calendar, XCircle, CheckCircle, Clock, Heart, Menu, Globe, Award } from 'lucide-react';

interface AdminStat {
  label: string;
  value: number | string;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const adminStats: AdminStat[] = [
  { label: 'Total Users', value: 247, variant: 'primary', icon: Users },
  { label: 'Active Sessions', value: 189, variant: 'success', icon: Heart },
  { label: 'System Uptime', value: '99.9%', variant: 'info', icon: Globe },
  { label: 'Total Logins', value: 5247, variant: 'secondary', icon: Award },
];

const AdminPage: React.FC = () => {
  const { notify } = useToast();

  const handleUserAction = (action: string) => {
    notify({
      title: 'Action Performed',
      description: `Admin action: ${action}`,
      variant: 'primary',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-muted-foreground mt-1">
                System administration and user management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Manage Users</span>
            </div>
          </div>
          </Card>
        </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {adminStats.map((stat, index) => (
          <Card
            key={index}
            className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <StatusBadge status={stat.variant} size="sm" />
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-2xl shadow-soft p-6 transition-all hover:shadow-medium">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">User Management</h3>
          <div className="space-y-3">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> View All Users
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Role Management
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Folder className="h-4 w-4" /> Department Settings
            </Button>
          </div>
        </Card>

        <Card className="bg-white rounded-2xl shadow-soft p-6 transition-all hover:shadow-medium">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">System Settings</h3>
          <div className="space-y-3">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> General Settings
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Attendance Settings
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> System Configuration
            </Button>
          </div>
        </Card>

        <Card className="bg-white rounded-2xl shadow-soft p-6 transition-all hover:shadow-medium">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Reports</h3>
          <div className="space-y-3">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" /> Attendance Report
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Performance Report
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Leave Report
            </Button>
          </div>
        </Card>

        <Card className="bg-white rounded-2xl shadow-soft p-6 transition-all hover:shadow-medium">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Security</h3>
          <div className="space-y-3">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Security Logs
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Recent Activity
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Access Control
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;