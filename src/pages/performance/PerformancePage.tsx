import React from 'react';
import AppraisalTable from '../../components/performance/AppraisalTable';
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Performance Management</h1>
      <AppraisalTable />
    </div>
  );
};

export default PerformancePage;