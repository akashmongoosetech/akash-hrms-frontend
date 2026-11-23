import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { TrendingUp, Users, BarChart2, Clipboard, Shield, Calendar, Award, Settings, AlertCircle, Clock, Plus } from 'lucide-react';

interface PerformanceMetric {
  _id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  period: string;
}

interface PerformanceStats {
  label: string;
  value: number;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const performanceStats: PerformanceStats[] = [
  { label: 'Average Score', value: 87, variant: 'primary', icon: Award },
  { label: 'Active Reviews', value: 45, variant: 'success', icon: Users },
  { label: 'On Track', value: 38, variant: 'info', icon: TrendingUp },
  { label: 'Behind Target', value: 7, variant: 'critical', icon: AlertCircle },
];

const PerformancePage: React.FC = () => {
  const { notify } = useToast();

  const handleAddReview = () => {
    notify({
      title: 'Review Added',
      description: 'New performance review created',
      variant: 'success',
    });
  };

  const metricData: PerformanceMetric[] = [
    { _id: '1', name: 'Quality', value: 92, target: 90, unit: '%', period: 'Q1 2024' },
    { _id: '2', name: 'Efficiency', value: 85, target: 90, unit: '%', period: 'Q1 2024' },
    { _id: '3', name: 'Timeliness', value: 95, target: 95, unit: '%', period: 'Q1 2024' },
    { _id: '4', name: 'Collaboration', value: 88, target: 90, unit: '%', period: 'Q1 2024' },
    { _id: '5', name: 'Innovation', value: 76, target: 85, unit: '%', period: 'Q1 2024' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Employee performance metrics and reviews
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Add Review</span>
            </div>
          </div>
          </Card>
        </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {performanceStats.map((stat, index) => (
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metricData.map((metric) => (
          <Card
            key={metric._id}
            className="bg-white rounded-xl shadow-soft p-5 transition-all hover:shadow-medium"
          >
            <div className="flex items-between justify-between mb-3">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{metric.name}</h4>
                <p className="text-sm text-gray-500">{metric.period}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{metric.value}{metric.unit}</p>
                <p className="text-xs text-gray-500">Target: {metric.target}{metric.unit}</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full bg-primary transition-width`}
                style={{ width: `${((metric.value / metric.target) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">${metric.value}</span>
              <span className="text-primary font-medium">${metric.target}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Overview */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="font-medium text-gray-900">On Track</span>
            <span className="text-gray-400">38 employees</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-info" />
            <span className="text-gray-400">Pending Reviews</span>
            <span className="ml-auto text-info font-medium">7</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-destructive" />
            <span className="text-gray-400">Overdue</span>
            <span className="ml-auto text-destructive font-medium">2</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PerformancePage;