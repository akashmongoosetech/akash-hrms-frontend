import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Users, Calendar, CheckCircle, Clock, Award, Settings, MapPin, Globe, AlertCircle } from 'lucide-react';

interface OnboardingTask {
  _id: string;
  title: string;
  type: 'documentation' | 'training' | 'setup' | 'compliance';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
}

interface OnboardingStats {
  label: string;
  value: number;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const onboardingStats: OnboardingStats[] = [
  { label: 'New Hires', value: 12, variant: 'primary', icon: Users },
  { label: 'Onboarded', value: 8, variant: 'success', icon: CheckCircle },
  { label: 'In Progress', value: 5, variant: 'info', icon: Clock },
  { label: 'Pending', value: 3, variant: 'critical', icon: AlertCircle },
];

const OnboardingPage: React.FC = () => {
  const { notify } = useToast();

  const handleTaskComplete = () => {
    notify({
      title: 'Task Completed',
      description: 'Onboarding task marked as completed',
      variant: 'success',
    });
  };

  const filterOptions = ['All Tasks', 'Pending', 'In Progress', 'Completed'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Onboarding</h1>
              <p className="text-sm text-muted-foreground mt-1">
                New employee orientation and setup
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Add Task</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Onboarding Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {onboardingStats.map((stat, index) => (
          <Card
            key={index}
            className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium"
          >
            <div className="flex items-center gap-3 mb-3">
              {(() => { const Icon = stat.icon as React.FC<{ className?: string }>; return <Icon className="h-5 w-5" />; })()}
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <StatusBadge status={stat.variant as any} size="sm" />
          </Card>
        ))}
      </div>

      {/* Onboarding Tasks */}
      <div className="bg-white rounded-xl shadow-soft mb-6">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-medium text-gray-900">Onboarding Tasks</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <OnboardingTaskItem key={num} task={{
                _id: String(num),
                title: `Onboarding Task ${num}`,
                type: num % 4 === 0 ? 'compliance' : num % 4 === 1 ? 'training' : num % 4 === 2 ? 'setup' : 'documentation',
                assignedTo: `HR Team ${num}`,
                dueDate: `2024-02-${num < 10 ? '0' : ''}${num}`,
                status: num <= 5 ? 'pending' : num <= 7 ? 'in-progress' : 'completed',
                progress: Math.random() * 100,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Onboarding Progress */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Onboarding Progress</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-gray-400" />
            <span className="text-sm text-gray-500">Total New Hires</span>
            <span className="ml-auto text-primary font-medium">12</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-success" />
            <span className="text-sm text-gray-500">Successfully Onboarded</span>
            <span className="ml-auto text-success font-medium">8</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-info" />
            <span className="text-sm text-gray-500">In Progress</span>
            <span className="ml-auto text-info font-medium">5</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-destructive" />
            <span className="text-sm text-gray-500">Pending</span>
            <span className="ml-auto text-destructive font-medium">3</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const OnboardingTaskItem = ({ task }: { task: OnboardingTask }) => {
  const statusMap: Record<string, { variant: string; bg: string }> = {
    pending: { variant: 'critical', bg: 'var(--destructive)' },
    'in-progress': { variant: 'info', bg: 'var(--info)' },
    completed: { variant: 'success', bg: 'var(--success)' },
  };

  const statusInfo = statusMap[task.status] || statusMap.pending;

  return (
    <div className="px-6 py-4 border-b border-border opacity-30 last:border-0 flex items-center gap-3">
      <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: statusInfo.bg }}>
        <StatusBadge status={task.status as any} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{task.title}</p>
        <p className="text-xs text-gray-500 truncate">{task.type}</p>
      </div>
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium" style={{ backgroundColor: statusInfo.bg, color: 'white' }}>
        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
      </div>
      <div className="text-right text-sm text-gray-500">
        <span>Due: {task.dueDate}</span>
      </div>
    </div>
  );
};

export default OnboardingPage;