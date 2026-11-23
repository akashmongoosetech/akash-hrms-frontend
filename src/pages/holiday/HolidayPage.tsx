import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Calendar, Sun, Moon, Users, CheckCircle, XCircle } from 'lucide-react';

interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: 'national' | 'religious' | 'company';
}

interface HolidayStats {
  label: string;
  value: number | string;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const holidayStats: HolidayStats[] = [
  { label: 'Total Holidays', value: 15, variant: 'primary', icon: Calendar },
  { label: 'This Month', value: 3, variant: 'success', icon: Sun },
  { label: 'Next Month', value: 2, variant: 'info', icon: Moon },
];

const HolidayPage: React.FC = () => {
  const { notify } = useToast();

  const handleAddHoliday = () => {
    notify({
      title: 'Holiday Added',
      description: 'New holiday has been added to the calendar',
      variant: 'success',
    });
  };

  const handleDeleteHoliday = () => {
    notify({
      title: 'Deleted',
      description: 'Holiday has been removed from the calendar',
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
              <h1 className="text-2xl font-bold text-gray-900">Holiday Calendar</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Company holidays and observances
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Add Holiday</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {holidayStats.map((stat, index) => (
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

      {/* Holiday Form */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Add New Holiday</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Holiday Name</label>
            <input
              type="text"
              placeholder="e.g., Independence Day"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Date</label>
            <input
              type="date"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Type</label>
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>National</option>
              <option>Religious</option>
              <option>Company</option>
            </select>
          </div>
          <div>
            <Button variant="primary" className="w-full">
              <Sun className="mr-2 h-4 w-4" /> Add Holiday
            </Button>
          </div>
        </div>
      </div>

      {/* Upcoming Holidays */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Holidays</h3>
          <Button variant="ghost" size="sm" className="text-sm text-primary/70">
            View All
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
            <Sun className="h-4 w-4 text-primary" />
            <span className="text-gray-500">Jan 26 - Republic Day</span>
            <StatusBadge status="success" size="sm" />
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
            <Moon className="h-4 w-4 text-primary" />
            <span className="text-gray-500">Feb 14 - Valentines Day</span>
            <StatusBadge status="info" size="sm" />
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
            <Sun className="h-4 w-4 text-primary" />
            <span className="text-gray-500">Mar 08 - womens day</span>
            <StatusBadge status="info" size="sm" />
          </div>
          <div className="flex items-center gap-3 py-2 last:border-0">
            <Moon className="h-4 w-4 text-primary" />
            <span className="text-gray-500">Mar 30 - Good Friday</span>
            <StatusBadge status="critical" size="sm" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HolidayPage;