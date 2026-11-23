import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Calendar, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

interface LeaveStats {
  label: string;
  value: number | string;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const leaveStats: LeaveStats[] = [
  { label: 'Pending Approval', value: 12, variant: 'info', icon: Clock },
  { label: 'Approved', value: 85, variant: 'success', icon: CheckCircle },
  { label: 'Rejected', value: 8, variant: 'critical', icon: XCircle },
  { label: 'Total Employees', value: 124, variant: 'primary', icon: Users },
];

const LeavePage: React.FC = () => {
  const { notify } = useToast();

  const handleApprove = () => {
    notify({
      title: 'Approved',
      description: 'Leave application has been approved',
      variant: 'success',
    });
  };

  const handleReject = () => {
    notify({
      title: 'Rejected',
      description: 'Leave application has been rejected',
      variant: 'destructive',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage employee leave applications and approvals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Filter by date</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {leaveStats.map((stat, index) => (
          <Card
            key={index}
            className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <StatusBadge status={stat.variant} size="sm" />
          </Card>
        ))}
      </div>

      {/* Action Filters */}
      <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>All Employees</option>
              <option>HR Department</option>
              <option>Engineering</option>
              <option>Marketing</option>
            </select>
          </div>
          <div className="flex-1">
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
          <Button variant="primary" size="sm">
            <CheckCircle className="mr-2 h-4 w-4" /> Approve Selected
          </Button>
          <Button variant="secondary" size="sm">
            <XCircle className="mr-2 h-4 w-4" /> Reject Selected
          </Button>
        </div>
      </div>

      {/* Leave Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-medium text-gray-900">Leave Applications</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border opacity-50">
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Employee</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Leave Type</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">From Date</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">To Date</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Days</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Status</th>
                  <th className="text-right text-sm font-medium text-muted-foreground px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border opacity-30">
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">John Doe</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Annual Leave</td>
                  <td className="px-6 py-4 text-sm text-gray-500">2024-01-15</td>
                  <td className="px-6 py-4 text-sm text-gray-500">2024-01-20</td>
                  <td className="px-6 py-4 text-sm text-gray-500">6</td>
                  <td className="px-6 py-4">
                    <StatusBadge status="info" size="sm" />
                    Pending
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-sm text-primary/70">
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-sm text-destructive/70">
                      Reject
                    </Button>
                  </td>
                </tr>
                {/* More rows... */}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Showing 1-10 of 15 applications</p>
            <nav className="flex">
              <button className="prev button text-xs font-medium text-primary/60 hover:text-primary transition-colors">
                ← Prev
              </button>
              <span className="mx-2 text-xs text-gray-500">1</span>
              <button className="next button text-xs font-medium text-primary/60 hover:text-primary transition-colors">Next →</button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavePage;