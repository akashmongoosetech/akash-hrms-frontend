import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Users, Folder, Shield, Clock, Settings, MapPin, Heart } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'away';
  joinDate: string;
}

interface TeamStats {
  label: string;
  value: number | string;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const teamStats: TeamStats[] = [
  { label: 'Total Teams', value: 8, variant: 'primary', icon: Folder },
  { label: 'Total Members', value: 47, variant: 'secondary', icon: Users },
  { label: 'Active This Week', value: 38, variant: 'success', icon: Heart },
  { label: 'On Leave', value: 5, variant: 'info', icon: Clock },
];

const TeamPage: React.FC = () => {
  const { notify } = useToast();

  const handleAddMember = () => {
    notify({
      title: 'Member Added',
      description: 'New team member has been added successfully',
      variant: 'success',
    });
  };

  const handleViewDetails = (memberId: string) => {
    notify({
      title: 'View Details',
      description: 'Viewing team member profile',
      variant: 'info',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Organize and manage team structure
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Add Team Member</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {teamStats.map((stat, index) => (
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

      {/* Team Members Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Left: Team Structure */}
        <Card className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Structure</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Engineering Team</p>
                <p className="text-xs text-gray-500">5 members</p>
              </div>
              <StatusBadge status="online" size="sm" />
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">HR Department</p>
                <p className="text-xs text-gray-500">3 members</p>
              </div>
              <StatusBadge status="away" size="sm" />
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
              <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Operations</p>
                <p className="text-xs text-gray-500">2 members</p>
              </div>
              <StatusBadge status="info" size="sm" />
            </div>
            <div className="flex items-center gap-3 py-2 last:border-0">
              <div className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Marketing</p>
                <p className="text-xs text-gray-500">4 members</p>
              </div>
              <StatusBadge status="offline" size="sm" />
            </div>
          </div>
        </Card>

        {/* Right: Add Member */}
        <Card className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Member</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Role</label>
              <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option>Select Role</option>
                <option>Developer</option>
                <option>Manager</option>
                <option>Designer</option>
                <option>Analyst</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Department</label>
              <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option>Select Department</option>
                <option>Engineering</option>
                <option>HR</option>
                <option>Operations</option>
                <option>Marketing</option>
              </select>
            </div>
            <Button variant="primary" type="submit">
              <Users className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TeamPage;