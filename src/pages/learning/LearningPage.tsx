import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Users, GraduationCap, Calendar, BarChart2, Shield, BookOpen, Search, Clock } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  instructor: string;
  students: number;
  progress: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'published' | 'draft' | 'archived';
  duration: string;
  rating: number;
}

interface LearningStats {
  label: string;
  value: number | string;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const learningStats: LearningStats[] = [
  { label: 'Total Courses', value: 28, variant: 'primary', icon: BookOpen },
  { label: 'Active Learners', value: 156, variant: 'success', icon: Users },
  { label: 'Average Completion', value: '73%', variant: 'info', icon: GraduationCap },
  { label: 'Total Hours', value: 487, variant: 'info', icon: Clock },
];

const LearningPage: React.FC = () => {
  const { notify } = useToast();

  const handleEnroll = () => {
    notify({
      title: 'Enrolled',
      description: 'Successfully enrolled in the course',
      variant: 'success',
    });
  };

  const filterOptions = ['All Courses', 'Beginner', 'Intermediate', 'Advanced', 'Completed'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Learning Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Employee training and course management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Create Course</span>
            </div>
          </div>
          </Card>
        </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {learningStats.map((stat, index) => (
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
            <StatusBadge status={stat.variant} size="sm" />
          </Card>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl shadow-soft mb-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>All Courses</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>All Levels</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button variant="primary" size="sm">
            <Search className="mr-2 h-4 w-4" /> Enroll
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map(
          (num) => (
            <Card
              key={num}
              className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Course {num}
                  </h3>
                  <StatusBadge status="info" size="sm" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Instructor: John Doe</p>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-500">128 students</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <BarChart2 className="h-3 w-3 text-primary" />
                    <span className="text-xs text-gray-500">73% complete</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">4.5 ★</p>
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default LearningPage;