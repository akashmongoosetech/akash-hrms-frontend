import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { BarChart2, Layout, Users, Calendar, Clipboard, Shield, TrendingUp, Settings, Medal } from 'lucide-react';

interface ReportFilter {
  type: 'date' | 'department' | 'employee';
  value: string;
}

interface ReportData {
  name: string;
  category: string;
  value: number;
  percentage: number;
  trend?: 'up' | 'down';
}

const ReportFilters: ReportFilter[] = [
  { type: 'date', value: 'This Month' },
  { type: 'date', value: 'This Quarter' },
  { type: 'date', value: 'This Year' },
  { type: 'department', value: 'All Departments' },
  { type: 'employee', value: 'All Employees' },
];

const reportData: ReportData[] = [
  { name: 'Department Distribution', category: 'HR', value: 24, percentage: 19 },
  { name: 'Department Distribution', category: 'Engineering', value: 38, percentage: 30 },
  { name: 'Department Distribution', category: 'Marketing', value: 16, percentage: 13 },
  { name: 'Department Distribution', category: 'Operations', value: 12, percentage: 9 },
  { name: 'Department Distribution', category: 'Finance', value: 8, percentage: 6 },
  { name: 'Department Distribution', category: 'Admin', value: 6, percentage: 5 },
  { name: 'Department Distribution', category: 'Other', value: 10, percentage: 17 },
];

const ReportsPage: React.FC = () => {
  const { notify } = useToast();

  const handleGenerateReport = () => {
    notify({
      title: 'Report Generated',
      description: 'Report has been successfully generated',
      variant: 'success',
    });
  };

  const handleExport = (format: string) => {
    notify({
      title: 'Exported',
      description: `Report exported as ${format}`,
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
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Data-driven insights and HR analytics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Generate Report</span>
            </div>
          </div>
          </Card>
        </div>

      {/* Report Filters */}
      <div className="bg-white rounded-xl shadow-soft mb-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>Date Range</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
            <option>Custom Range</option>
          </select>
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>Department</option>
            <option>All Departments</option>
            <option>HR</option>
            <option>Engineering</option>
          </select>
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>Employee</option>
            <option>All Employees</option>
            <option>Active</option>
            <option>On Leave</option>
          </select>
          <Button variant="primary" size="sm">
            <BarChart2 className="mr-2 h-4 w-4" /> Generate
          </Button>
          <Button variant="secondary" size="sm">
            <Export className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Revenue & Growth Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue Growth</p>
              <p className="text-2xl font-bold text-gray-900">12.5%</p>
            </div>
            <StatusBadge status="success" size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <Medal className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Performance Score</p>
              <p className="text-2xl font-bold text-gray-900">87/100</p>
            </div>
            <StatusBadge status="info" size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">124</p>
            </div>
            <StatusBadge status="primary" size="sm" />
          </div>
        </Card>
      </div>

      {/* Department Distribution */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department Distribution</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div key={num} className="flex items-center justify-between py-2 border-b border-border opacity-20 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">Engineering</span>
                  <span className="text-xs text-gray-500">30%</span>
                </div>
              </div>
              <div className="w-32 h-2 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-primary transition-width`}
                  style={{ width: `${num * 12}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">${num * 5}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Employee Performance */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Performance</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Medal className="h-3 w-3 text-primary" />
            <span className="font-medium text-gray-900">Top Performer</span>
            <span className="text-xs text-gray-400">95%</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-success" />
            <span className="font-medium text-gray-900">Meeting Targets</span>
            <span className="text-xs text-gray-400">89%</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-info" />
            <span className="font-medium text-gray-900">Training Completion</span>
            <span className="text-xs text-gray-400">73%</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;