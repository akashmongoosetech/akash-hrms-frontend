import React from 'react';
import { Card, StatCard, StatusBadge, Button } from '../../components/ui';
import { useState, useEffect } from 'react';
import { Menu, Settings, AlertCircle, Users, Clock, Shield, Sparkles } from 'lucide-react';

interface DashboardStat {
  id: string;
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
  description?: string;
}

const dashboardStats: DashboardStat[] = [
  {
    id: 'employees',
    title: 'Total Employees',
    value: 247,
    trend: 'up',
    variant: 'primary',
    icon: Users,
    description: 'Active across all departments'
  },
  {
    id: 'attendance',
    title: 'Today Attendance',
    value: 189,
    trend: 'up',
    variant: 'success',
    icon: Clock,
    description: 'Check-in completed'
  },
  {
    id: 'leaves',
    title: 'Leave Applications',
    value: 15,
    trend: 'neutral',
    variant: 'info',
    icon: Calendar,
    description: 'Pending approval'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    value: 3,
    trend: 'up',
    variant: 'critical',
    icon: AlertCircle,
    description: 'New alerts'
  }
];

const Dashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xl font-semibold text-gray-900">HRMS Dashboard</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-primary">3 new</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className="relative p-2 rounded-md hover:bg-primary/5 transition-colors"
              aria-label="Notifications"
            >
              <bellOff className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-primary text-xs font-medium">3</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {dashboardStats.map((stat) => (
            <Card
              key={stat.id}
              className="p-6 bg-white rounded-2xl shadow-soft transition-all hover:shadow-medium"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </h3>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <StatusBadge status={stat.variant || 'info'} size="sm" />
                  <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                </div>
              </div>
              
              {/* Trend indicator */}
              {stat.trend && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <svg
                    className={`h-3 w-3 text-${stat.trend === 'up' ? 'green-500' : stat.trend === 'down' ? 'red-500' : 'gray-500'}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 5H7a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4z"
                    />
                    <path d="M15 5h2a2 2 0 0 1 2 2v3m2 6v3a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-3m2-6v3a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-3" />
                  </svg>
                  <span className="text-xs font-medium text-gray-500">
                    {stat.trend === 'up' ? 'Up' : stat.trend === 'down' ? 'Down' : 'Stable'}
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button variant="primary" className="flex-1">
            <Users className="mr-2 h-4 w-4" /> View All Employees
          </Button>
          <Button variant="secondary" className="flex-1">
            <Calendar className="mr-2 h-4 w-4" /> Manage Leave
          </Button>
          <Button variant="primary" className="flex-1">
            <Clock className="mr-2 h-4 w-4" /> Attendance
          </Button>
          <Button variant="secondary" className="flex-1">
            <AlertCircle className="mr-2 h-4 w-4" /> View Notifications
          </Button>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 bg-white rounded-2xl shadow-soft">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
              <Avatar className="h-6 w-6" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">John Doe</p>
                <p className="text-muted-foreground">Just now</p>
              </div>
              <StatusBadge status="online" size="sm" />
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-border opacity-20">
              <svg
                className="h-4 w-4 text-primary"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3 4h18M3 12h18M3 20h18" />
              </svg>
              <span className="text-gray-500">3:42 PM</span>
              <span className="ml-2 text-primary">John approved leave</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
              <Avatar className="h-6 w-6" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Jane Smith</p>
                <p className="text-muted-foreground">2:15 PM</p>
              </div>
              <StatusBadge status="away" size="sm" />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;